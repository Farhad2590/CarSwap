const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.createPayment);
router.get('/process/:id', paymentController.processPayment);
router.get('/history/:email', paymentController.getPaymentHistory);

module.exports = router;