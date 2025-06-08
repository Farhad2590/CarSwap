const express = require("express");
const router = express.Router();
const subscriptionPaymentController = require("../controllers/subscriptionPaymentController");

router.post("/:email", subscriptionPaymentController.recordVerificationPayment);
router.get("/:email", subscriptionPaymentController.getSubscriptionPayments);
router.get("/", subscriptionPaymentController.getAllSubscriptionPayments);
router.get("/transactions/:email", subscriptionPaymentController.getUserTransactions);

module.exports = router;