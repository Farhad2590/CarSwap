const PaymentModel = require("../models/paymentModel");
const UserModel = require("../models/userModel");

const paymentController = {
  createPayment: async (req, res) => {
    try {
      const { email, amount, purpose, verificationData } = req.body;

      const paymentData = {
        userEmail: email,
        amount,
        purpose,
        status: "pending",
        verificationData: purpose === "verification" ? verificationData : null,
      };

      const payment = await PaymentModel.createPayment(paymentData);

      res.status(201).json({
        success: true,
        paymentId: payment._id,
        paymentUrl: `http://localhost:9000/payment/process/${payment._id}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  processPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: "Payment not found",
        });
      }

      // In a real app, you would redirect to a payment gateway here
      // For demo purposes, we'll simulate a successful payment
      const updatedPayment = await PaymentModel.updatePaymentStatus(
        id,
        "completed",
        "simulated_txn_" + Math.random().toString(36).substring(7)
      );

      if (payment.purpose === "verification") {
        await UserModel.updateVerificationData(payment.userEmail, {
          ...payment.verificationData,
          status: "pending",
          submittedAt: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        payment: updatedPayment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getPaymentHistory: async (req, res) => {
    try {
      const { email } = req.params;
      const payments = await PaymentModel.getPaymentsByUser(email);
      res.json({
        success: true,
        payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = paymentController;
