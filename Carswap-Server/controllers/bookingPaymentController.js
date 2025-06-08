const BookingPaymentModel = require("../models/bookingPaymentModel");
const BookingModel = require("../models/bookingModel");
const UserModel = require("../models/userModel");

const bookingPaymentController = {
  recordAdvancePayment: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { amount, email } = req.body;

      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const transactionId = `BOOK_${Date.now()}_${bookingId}`;
      const payment = await BookingPaymentModel.createPayment({
        bookingId,
        amount,
        status: "completed",
        paymentMethod: "online",
        transactionId,
        userEmail: email,
        type: "advance",
      });

      // Update admin balance (40% commission)
      await UserModel.updateUserBalance(
        "carswap@gmail.com",
        amount * 0.4,
        "credit",
        `Advance payment from ${email} (Booking: ${bookingId})`
      );

      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  recordCashPayment: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { amount } = req.body;

      const booking = await BookingModel.getBookingDetails(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const payment = await BookingPaymentModel.recordCashPayment(bookingId, amount);
      
      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getBookingPayments: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const payments = await BookingPaymentModel.getPaymentsByBooking(bookingId);
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllBookingPayments: async (req, res) => {
    try {
      const payments = await BookingPaymentModel.getAllPayments();
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  distributeOwnerPayment: async (req, res) => {
    try {
      const { bookingId } = req.params;
      await BookingPaymentModel.distributeOwnerPayment(bookingId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bookingPaymentController;