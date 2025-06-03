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

      if (booking.status !== "payment_pending") {
        return res
          .status(400)
          .json({ error: "Booking not in payment pending state" });
      }

      const transactionId = `BOOK_${Date.now()}_${bookingId}`;

      const paymentData = new URLSearchParams({
        store_id: process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21",
        store_passwd:
          process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl",
        total_amount: amount.toString(),
        currency: "BDT",
        tran_id: transactionId,
        success_url: "http://localhost:5173/payment-result?payment=success",
        fail_url: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/payment-result?payment=failed`,
        cancel_url: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/payment-result?payment=cancelled`,

        ipn_url: `${
          process.env.BACKEND_URL || "http://localhost:9000"
        }/booking/${bookingId}/payment-ipn`,
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

      await PaymentModel.createPayment({
        bookingId: bookingId,
        amount: amount,
        status: "pending",
        paymentMethod: "sslcommerz",
        transactionId: transactionId,
        userEmail: email,
        type: "advance",
      });

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

  handlePaymentIPN: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { tran_id, status, val_id } = req.body;

      if (status !== "VALID") {
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${
        process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21"
      }&store_passwd=${
        process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl"
      }&format=json`;

      const verifyResponse = await axios.get(verifyUrl);

      if (verifyResponse.data.status !== "VALID") {
        return res.status(400).json({ error: "Payment verification failed" });
      }

      await PaymentModel.updatePaymentStatusByTransactionId(
        tran_id,
        "completed",
        val_id
      );

      const bookingUpdate = await BookingModel.markAdvancePaid(
        bookingId,
        verifyResponse.data
      );

      res.json({ success: true, booking: bookingUpdate });
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

      const result = await BookingModel.markDelivered(bookingId);
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
