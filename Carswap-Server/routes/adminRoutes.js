const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin specific routes
router.get('/pending-posts', adminController.getPendingPosts);
router.get('/pending-verifications', adminController.getPendingVerifications);
router.get('/analytics', adminController.getPlatformAnalytics);
router.post('/resolve-dispute', adminController.resolveDispute);

module.exports = router;