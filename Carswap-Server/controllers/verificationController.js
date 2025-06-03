const VerificationModel = require("../models/verificationModel");

const verificationController = {
  getPendingVerifications: async (req, res) => {
    try {
      const result = await VerificationModel.getPendingVerifications();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  verifyDriverLicense: async (req, res) => {
    try {
      const { userId, userType } = req.params;
      const { status, adminNotes } = req.body;
      const result = await VerificationModel.verifyDriverLicense(
        userId,
        userType,
        status,
        adminNotes
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  verifyCarDocuments: async (req, res) => {
    try {
      const { carId } = req.params;
      const { status, adminNotes } = req.body;
      const result = await VerificationModel.verifyCarDocuments(
        carId,
        status,
        adminNotes
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getVerificationStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await VerificationModel.getVerificationStatus(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = verificationController;
