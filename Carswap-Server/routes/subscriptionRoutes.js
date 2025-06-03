const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Subscription routes
router.post('/', subscriptionController.createSubscriptionPlan);
router.get('/', subscriptionController.getAllSubscriptionPlans);
router.post('/:userId/subscribe', subscriptionController.subscribeUser);
router.get('/:userId/status', subscriptionController.getUserSubscriptionStatus);
router.put('/:userId/verify', subscriptionController.verifySubscriptionUser);

module.exports = router;