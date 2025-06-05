const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Booking routes
router.post("/", bookingController.createBooking);
router.get("/:bookingId", bookingController.getBookingDetails);
router.put("/:bookingId/cancel", bookingController.rejectBooking);
router.get("/user/:userId", bookingController.getUserBookings);
router.put("/:bookingId/accept", bookingController.acceptBooking);
router.put("/:bookingId/reject", bookingController.rejectBooking);
router.post("/:bookingId/payment", bookingController.processPayment);
router.get("/user/email/:userEmail", bookingController.getUserBookings);

// Payment callback routes - FIXED: Added both GET and POST for compatibility
router.get("/:bookingId/payment-success", bookingController.handlePaymentSuccess);
router.post("/:bookingId/payment-success", bookingController.handlePaymentSuccess);

router.get("/:bookingId/payment-failed", bookingController.handlePaymentFailed);
router.post("/:bookingId/payment-failed", bookingController.handlePaymentFailed);

router.get("/:bookingId/payment-cancelled", bookingController.handlePaymentCancelled);
router.post("/:bookingId/payment-cancelled", bookingController.handlePaymentCancelled);

router.post("/:bookingId/payment-ipn", bookingController.handlePaymentIPN);

// Booking status update routes
router.put("/:bookingId/pickup-details", bookingController.setPickupDetails);
router.put("/:bookingId/picked-up", bookingController.markPickedUp);
router.put("/:bookingId/delivered", bookingController.markDelivered);
router.put("/:bookingId/complete", bookingController.completeBooking);
router.put("/:bookingId/picked-and-payment-done", bookingController.markPickedAndPaymentDone);

module.exports = router;