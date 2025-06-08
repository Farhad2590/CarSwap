const SubscriptionPaymentModel = require("../models/subscriptionPaymentModel");
const BookingPaymentModel = require("../models/bookingPaymentModel");
const UserModel = require("../models/userModel");

const subscriptionPaymentController = {
  recordVerificationPayment: async (req, res) => {
    try {
      const { email } = req.params;
      const { amount } = req.body;

      const transactionId = `VERIFY_${Date.now()}_${email}`;
      const payment = await SubscriptionPaymentModel.createPayment({
        userEmail: email,
        amount,
        status: "completed",
        paymentMethod: "online",
        transactionId,
        type: "verification",
      });

      // Update admin balance
      await UserModel.updateUserBalance(
        "carswap@gmail.com",
        amount,
        "credit",
        `Verification fee from ${email}`
      );

      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSubscriptionPayments: async (req, res) => {
    try {
      const { email } = req.params;
      const payments = await SubscriptionPaymentModel.getPaymentsByUser(email);
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllSubscriptionPayments: async (req, res) => {
    try {
      const payments = await SubscriptionPaymentModel.getAllPayments();
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserTransactions: async (req, res) => {
    try {
      const { email } = req.params;
      const subscriptionPayments = await SubscriptionPaymentModel.getPaymentsByUser(email);
      const bookingPayments = await BookingPaymentModel.getPaymentsByUser(email);
      
      res.json({
        success: true,
        transactions: {
          subscriptions: subscriptionPayments,
          bookings: bookingPayments
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = subscriptionPaymentController;