const BookingModel = require("../models/bookingModel");
const BookingPaymentModel = require("../models/bookingPaymentModel");
const UserModel = require("../models/userModel");
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

      // Use BookingPaymentModel instead of PaymentModel
      await BookingPaymentModel.createPayment({
        bookingId: bookingId,
        amount: amount,
        status: "pending",
        paymentMethod: "sslcommerz",
        transactionId: transactionId,
        userEmail: email,
        type: "advance",
      });

      await BookingModel.updateBookingStatus(bookingId, "payment_in_progress");

      res.json({
        success: true,
        paymentUrl: response.data.GatewayPageURL,
        transactionId: transactionId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  handlePaymentSuccess: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { tran_id, amount } = { ...req.body, ...req.query };

      if (!tran_id || !amount) {
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
      const paymentData = verifyResponse.data?.element?.[0];
      if (
        !verifyResponse.data ||
        verifyResponse.data.APIConnect !== "DONE" ||
        verifyResponse.data.no_of_trans_found !== 1 ||
        !paymentData ||
        paymentData.status !== "VALID" ||
        paymentData.tran_id !== tran_id
      ) {
        // Use BookingPaymentModel instead of PaymentModel
        await BookingPaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          "failed"
        );

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=verification_failed&booking_id=${bookingId}&tran_id=${tran_id}`
        );
      }

      // Use BookingPaymentModel instead of PaymentModel
      await BookingPaymentModel.updatePaymentStatusByTransactionId(
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

      // Update admin and owner balances
      const booking = await BookingModel.getBookingDetails(bookingId);
      if (booking) {
        await updateAdminBalance(
          booking.renterEmail,
          tran_id,
          amount,
          bookingId,
          "booking"
        );
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=success&tran_id=${tran_id}&amount=${amount}&booking_id=${bookingId}`
      );
    } catch (error) {
      const tran_id = req.query.tran_id || req.body.tran_id;
      if (tran_id) {
        try {
          // Use BookingPaymentModel instead of PaymentModel
          await BookingPaymentModel.updatePaymentStatusByTransactionId(
            tran_id,
            "failed"
          );
        } catch (updateError) {
          console.error("Error updating payment status:", updateError);
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
        await PaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          "failed"
        );
      }

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
        await PaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          "cancelled"
        );
      }

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

      await PaymentModel.updatePaymentStatusByTransactionId(
        tran_id,
        "completed",
        val_id
      );

      const bookingUpdate = await BookingModel.markAdvancePaid(bookingId, {
        transactionId: tran_id,
        amount: amount,
        currency: currency,
        paymentMethod: "sslcommerz",
        paidAt: new Date(),
        paymentDetails: verifyResponse.data,
      });

      // Update admin and owner balances
      const booking = await BookingModel.getBookingDetails(bookingId);
      if (booking) {
        await updateAdminBalance(
          booking.renterEmail,
          tran_id,
          amount,
          bookingId,
          "booking"
        );
      }

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

  markPickedUp: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { finalPaymentDetails } = req.body;

      const result = await BookingModel.markPickedUp(
        bookingId,
        finalPaymentDetails
      );

      // Update admin and owner balances for cash payment
      const booking = await BookingModel.getBookingDetails(bookingId);
      if (booking) {
        const amount = booking.estimatedTotal * 0.5; // Assuming this is the cash payment amount
        await updateAdminBalance(
          booking.renterEmail,
          `CASH_${Date.now()}`,
          amount,
          bookingId,
          "booking_cash"
        );
      }

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

  markDelivered: async (req, res) => {
    try {
      const { bookingId } = req.params;

      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

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

      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Transfer 90% to owner
      if (booking.paymentDetails?.amount && booking.ownerEmail) {
        const ownerAmount = booking.paymentDetails.amount * 0.9;
        await UserModel.updateUserBalance(
          booking.ownerEmail,
          ownerAmount,
          "credit",
          `Booking payment for booking ID: ${bookingId}`
        );
      }

      const result = await BookingModel.completeBooking(
        bookingId,
        reviewDetails
      );

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

  markAsReviewed: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const result = await BookingModel.markAsReviewed(bookingId);

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ error: "Booking not found or already reviewed" });
      }

      res.json({
        success: true,
        message: "Booking marked as reviewed successfully",
        result,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

// async function updateAdminBalance(
//   userEmail,
//   transactionId,
//   amount,
//   bookingId,
//   paymentType = "booking"
// ) {
//   try {
//     const description = `${paymentType} payment from ${userEmail} (Transaction: ${transactionId}, Booking: ${bookingId})`;
//     console.log(amount);

//     // Update admin balance (10% commission)
//     const adminAmount = amount * 0.1;
//     await UserModel.updateUserBalance(
//       "carswap@gmail.com",
//       adminAmount,
//       "credit",
//       description
//     );

//     // Update owner balance (90% of payment)
//     const ownerAmount = amount * 0.9;
//     const booking = await BookingModel.getBookingDetails(bookingId);
//     if (booking && booking.ownerEmail) {
//       await UserModel.updateUserBalance(
//         booking.ownerEmail,
//         ownerAmount,
//         "credit",
//         description
//       );
//     }

//     return { adminAmount, ownerAmount };
//   } catch (error) {
//     console.error("Error updating balances:", error);
//     throw error;
//   }
// }

async function updateAdminBalance(
  userEmail,
  transactionId,
  amount,
  bookingId,
  paymentType = "booking"
) {
  try {
    const description = `${paymentType} payment from ${userEmail} (Transaction: ${transactionId}, Booking: ${bookingId})`;
    console.log(amount);

    // Update admin balance (100% of payment)
    await UserModel.updateUserBalance(
      "carswap@gmail.com",
      amount,
      "credit",
      description
    );

    return { amount };
  } catch (error) {
    console.error("Error updating balances:", error);
    throw error;
  }
}

module.exports = bookingController;
