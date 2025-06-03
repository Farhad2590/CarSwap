// reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes
router.post('/', reviewController.createReview);
router.get('/car/:carId', reviewController.getCarReviews);
router.get('/owner/:ownerId', reviewController.getOwnerReviews);
router.get('/renter/:renterId', reviewController.getRenterReviews);

module.exports = router;