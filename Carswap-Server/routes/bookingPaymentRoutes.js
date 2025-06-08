const express = require("express");
const router = express.Router();
const bookingPaymentController = require("../controllers/bookingPaymentController");

router.post("/:bookingId/advance", bookingPaymentController.recordAdvancePayment);
router.post("/:bookingId/cash", bookingPaymentController.recordCashPayment);
router.get("/:bookingId", bookingPaymentController.getBookingPayments);
router.get("/", bookingPaymentController.getAllBookingPayments);
router.post("/:bookingId/distribute", bookingPaymentController.distributeOwnerPayment);

module.exports = router;