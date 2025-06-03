const SubscriptionModel = require('../models/subscriptionModel');

const subscriptionController = {
  createSubscriptionPlan: async (req, res) => {
    try {
      const planData = req.body;
      const result = await SubscriptionModel.createSubscriptionPlan(planData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllSubscriptionPlans: async (req, res) => {
    try {
      const result = await SubscriptionModel.getAllSubscriptionPlans();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  subscribeUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const subscriptionData = req.body;
      const result = await SubscriptionModel.subscribeUser(userId, subscriptionData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserSubscriptionStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await SubscriptionModel.getUserSubscriptionStatus(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  verifySubscriptionUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isVerified } = req.body;
      const result = await SubscriptionModel.verifySubscriptionUser(userId, isVerified);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = subscriptionController;