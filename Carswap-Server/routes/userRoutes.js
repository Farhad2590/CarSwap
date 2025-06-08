const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Basic user CRUD routes
router.get("/", userController.getAllUsers);
router.get("/:email", userController.getUserByEmail);
router.put("/:email", userController.updateUserByEmail);
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);

// Verification routes
router.post("/initiate-verification", userController.initiateVerification);
router.post("/verify-ipn", userController.handleVerificationIPN);
router.post("/approve-verification/:email", userController.approveVerification);
router.post("/reject-verification/:email", userController.rejectVerification);
router.get("/pending-verifications", userController.getPendingVerifications);

router.get("/verify-success", userController.handleVerificationCallback);
router.post("/verify-success", userController.handleVerificationCallback);
router.get("/verify-failed", userController.handleVerificationCallback);
router.post("/verify-failed", userController.handleVerificationCallback);
router.get("/verify-cancelled", userController.handleVerificationCallback);
router.post("/verify-cancelled", userController.handleVerificationCallback);

// Role checking routes
router.get("/admin/:email", userController.checkAdminStatus);
router.get("/owner/:email", userController.checkOwnerStatus);
router.get("/renter/:email", userController.checkRenterStatus);

// Balance routes
router.post('/:email/balance', userController.updateUserBalance);
router.get('/:email/balance', userController.getUserBalance);
router.post('/update-admin-balance', userController.updateAdminBalance);

module.exports = router;