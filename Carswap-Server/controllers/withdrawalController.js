const WithdrawalModel = require("../models/withdrawalModel");
const UserModel = require("../models/userModel");

const withdrawalController = {
  createWithdrawal: async (req, res) => {
    try {
      const { ownerEmail, amount, paymentMethod, accountNumber } = req.body;

      // Check if owner has sufficient balance
      const owner = await UserModel.getUserByEmail(ownerEmail);
      if (!owner || (owner.balance || 0) < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const withdrawalData = {
        ownerEmail,
        amount,
        paymentMethod,
        accountNumber,
      };

      const result = await WithdrawalModel.createWithdrawal(withdrawalData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getWithdrawalsByOwner: async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      const result = await WithdrawalModel.getWithdrawalsByOwner(ownerEmail);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPendingWithdrawals: async (req, res) => {
    try {
      const result = await WithdrawalModel.getPendingWithdrawals();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  approveWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { adminNotes } = req.body;

      const result = await WithdrawalModel.approveWithdrawal(
        withdrawalId,
        adminNotes
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  rejectWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { adminNotes } = req.body;

      const result = await WithdrawalModel.rejectWithdrawal(
        withdrawalId,
        adminNotes
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = withdrawalController;