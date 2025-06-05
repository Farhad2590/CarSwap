const BookingModel = require("../models/bookingModel");
const PaymentModel = require("../models/paymentModel");
const axios = require("axios");

const bookingController = {
  createBooking: async (req, res) => {
    try {
      const bookingData = req.body;
      const result = await BookingModel.createBooking(bookingData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getBookingDetails: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  acceptBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const result = await BookingModel.acceptBooking(bookingId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  rejectBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { rejectionReason } = req.body;
      const result = await BookingModel.rejectBooking(
        bookingId,
        rejectionReason
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  processPayment: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { amount, email } = req.body;

      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Validate booking status
      if (!["payment_pending", "pending_acceptance"].includes(booking.status)) {
        return res.status(400).json({
          error: `Booking is in ${booking.status} state and cannot accept payments`,
          currentStatus: booking.status,
        });
      }

      const transactionId = `BOOK_${Date.now()}_${bookingId}`;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const backendUrl = process.env.BACKEND_URL || "http://localhost:9000";

      const paymentData = new URLSearchParams({
        store_id: process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21",
        store_passwd:
          process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl",
        total_amount: amount.toString(),
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${backendUrl}/booking/${bookingId}/payment-success?tran_id=${transactionId}&amount=${amount}&booking_id=${bookingId}`,
        fail_url: `${backendUrl}/booking/${bookingId}/payment-failed?tran_id=${transactionId}&amount=${amount}&booking_id=${bookingId}`,
        cancel_url: `${backendUrl}/booking/${bookingId}/payment-cancelled?tran_id=${transactionId}&amount=${amount}&booking_id=${bookingId}`,
        ipn_url: `${backendUrl}/booking/${bookingId}/payment-ipn`,
        cus_name: booking.renterName || "Customer",
        cus_email: email,
        cus_phone: booking.renterPhone || "01700000000",
        cus_add1: "Car Rental Booking",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: "Car Rental Advance Payment",
        product_category: "Service",
        product_profile: "general",
        value_a: bookingId,
        value_b: booking.carId,
        value_c: booking.renterId,
        value_d: booking.ownerId,
      });

      const response = await axios.post(
        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        paymentData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.status !== "SUCCESS") {
        throw new Error(
          "Payment initiation failed: " + response.data.failedreason
        );
      }

      // Create payment record with pending status
      await PaymentModel.createPayment({
        bookingId: bookingId,
        amount: amount,
        status: "pending",
        paymentMethod: "sslcommerz",
        transactionId: transactionId,
        userEmail: email,
        type: "advance",
      });

      // Update booking status to payment_in_progress
      await BookingModel.updateBookingStatus(bookingId, "payment_in_progress");

      res.json({
        success: true,
        paymentUrl: response.data.GatewayPageURL,
        transactionId: transactionId,
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({
        error: error.message,
        details: error.response?.data || "Unknown error occurred",
      });
    }
  },

  handlePaymentSuccess: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { tran_id, amount } = {
        ...req.body,
        ...req.query,
      };

      console.log("Payment success callback:", {
        method: req.method,
        bookingId,
        tran_id,
        amount,
        query: req.query,
        body: req.body,
      });

      if (!tran_id || !amount) {
        console.error("Missing required payment parameters", {
          bookingId,
          tran_id,
          amount,
          query: req.query,
          body: req.body,
        });
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=missing_parameters&booking_id=${bookingId}&tran_id=${
            tran_id || ""
          }`
        );
      }
      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=${tran_id}&store_id=${
        process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21"
      }&store_passwd=${
        process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl"
      }&format=json`;

      const verifyResponse = await axios.get(verifyUrl);
      console.log("Payment verification response:", verifyResponse.data);
      const paymentData = verifyResponse.data?.element?.[0];
      if (
        !verifyResponse.data ||
        verifyResponse.data.APIConnect !== "DONE" ||
        verifyResponse.data.no_of_trans_found !== 1 ||
        !paymentData ||
        paymentData.status !== "VALID" ||
        paymentData.tran_id !== tran_id
      ) {
        console.error("Payment verification failed:", verifyResponse.data);
        await PaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          "failed"
        );

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=verification_failed&booking_id=${bookingId}&tran_id=${tran_id}`
        );
      }

      await PaymentModel.updatePaymentStatusByTransactionId(
        tran_id,
        "completed",
        paymentData.val_id || null
      );

      const bookingUpdate = await BookingModel.markAdvancePaid(bookingId, {
        transactionId: tran_id,
        amount: amount,
        currency: paymentData.currency || "BDT",
        paymentMethod: "sslcommerz",
        paidAt: new Date(),
        paymentDetails: paymentData,
      });

      console.log("Payment and booking updated successfully:", bookingUpdate);

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=success&tran_id=${tran_id}&amount=${amount}&booking_id=${bookingId}`
      );
    } catch (error) {
      console.error("Payment success handling error:", error);

      const tran_id = req.query.tran_id || req.body.tran_id;
      if (tran_id) {
        try {
          await PaymentModel.updatePaymentStatusByTransactionId(
            tran_id,
            "failed"
          );
        } catch (updateError) {
          console.error("Error updating payment status:", updateError);
        }
      }

      if (req.params.bookingId) {
        try {
          await BookingModel.updateBookingStatus(
            req.params.bookingId,
            "payment_pending"
          );
        } catch (updateError) {
          console.error("Error updating booking status:", updateError);
        }
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=failed&error=${encodeURIComponent(
          error.message
        )}&booking_id=${req.params.bookingId}&tran_id=${tran_id || ""}`
      );
    }
  },
  handlePaymentFailed: async (req, res) => {
    try {
      const { bookingId } = req.params;
      // SSL Commerz sends parameters in query string even for POST requests
      const { tran_id, amount } = {
        ...req.body,
        ...req.query,
      };

      console.log("Payment failed callback:", {
        method: req.method,
        bookingId,
        tran_id,
        amount,
        query: req.query,
        body: req.body,
      });

      if (tran_id) {
        // Update payment status to failed
        await PaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          "failed"
        );
      }

      // Redirect to frontend with failed status
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=failed&tran_id=${
          tran_id || ""
        }&amount=${amount || ""}&booking_id=${bookingId}`
      );
    } catch (error) {
      console.error("Payment failed handling error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=failed&error=processing_error`
      );
    }
  },

  handlePaymentCancelled: async (req, res) => {
    try {
      const { bookingId } = req.params;
      // SSL Commerz sends parameters in query string even for POST requests
      const { tran_id, amount } = {
        ...req.body,
        ...req.query,
      };

      console.log("Payment cancelled callback:", {
        method: req.method,
        bookingId,
        tran_id,
        amount,
        query: req.query,
        body: req.body,
      });

      if (tran_id) {
        // Update payment status to cancelled
        await PaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          "cancelled"
        );
      }

      // Redirect to frontend with cancelled status
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=cancelled&tran_id=${
          tran_id || ""
        }&amount=${amount || ""}&booking_id=${bookingId}`
      );
    } catch (error) {
      console.error("Payment cancelled handling error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=cancelled&error=processing_error`
      );
    }
  },

  // Handle payment IPN (Instant Payment Notification) from SSL Commerz
  handlePaymentIPN: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { tran_id, status, val_id, amount, currency } = req.body;

      console.log("Payment IPN received:", {
        bookingId,
        tran_id,
        status,
        val_id,
      });

      if (status !== "VALID") {
        console.log("Invalid payment status:", status);
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      // Verify payment with SSL Commerz
      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${
        process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21"
      }&store_passwd=${
        process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl"
      }&format=json`;

      const verifyResponse = await axios.get(verifyUrl);
      console.log("Payment verification response:", verifyResponse.data);

      if (verifyResponse.data.status !== "VALID") {
        console.log("Payment verification failed");
        return res.status(400).json({ error: "Payment verification failed" });
      }

      // Update payment status
      await PaymentModel.updatePaymentStatusByTransactionId(
        tran_id,
        "completed",
        val_id
      );

      // Update booking status to advance_paid
      const bookingUpdate = await BookingModel.markAdvancePaid(bookingId, {
        transactionId: tran_id,
        amount: amount,
        currency: currency,
        paymentMethod: "sslcommerz",
        paidAt: new Date(),
        paymentDetails: verifyResponse.data,
      });

      console.log("Booking updated successfully:", bookingUpdate);

      res.json({
        success: true,
        message: "Payment processed successfully",
        booking: bookingUpdate,
      });
    } catch (error) {
      console.error("IPN handling error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  setPickupDetails: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { pickupDetails } = req.body;

      const result = await BookingModel.setPickupDetails(
        bookingId,
        pickupDetails
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markPickedAndPaymentDone: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const result = await BookingModel.markPickedAndPaymentDone(bookingId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markPickedUp: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { finalPaymentDetails } = req.body;

      const result = await BookingModel.markPickedUp(
        bookingId,
        finalPaymentDetails
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markDelivered: async (req, res) => {
    try {
      const { bookingId } = req.params;

      // First check if booking exists and is in correct status
      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Check if booking is in the correct status to be marked as delivered
      if (booking.status !== "picked_and_payment_done") {
        return res.status(400).json({
          error:
            "Booking must be in 'picked_and_payment_done' status to be marked as delivered",
          currentStatus: booking.status,
        });
      }

      const result = await BookingModel.markDelivered(bookingId);

      if (result.modifiedCount === 0) {
        return res
          .status(400)
          .json({ error: "Failed to update booking status" });
      }

      res.json({
        success: true,
        message: "Booking marked as delivered successfully",
        result,
      });
    } catch (error) {
      console.error("Error marking booking as delivered:", error);
      res.status(500).json({ error: error.message });
    }
  },

  completeBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { reviewDetails } = req.body;

      const result = await BookingModel.completeBooking(
        bookingId,
        reviewDetails
      );

      // Calculate and distribute commission
      const booking = await BookingModel.getBookingDetails(bookingId);
      const commission = booking.estimatedTotal * 0.4;

      // Here you would add logic to transfer commission to admin account
      // This would typically involve updating a transactions collection

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const { userEmail } = req.params;
      const result = await BookingModel.getUserBookings(userEmail);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getOwnerBookings: async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      const result = await BookingModel.getOwnerBookings(ownerEmail);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = bookingController;
