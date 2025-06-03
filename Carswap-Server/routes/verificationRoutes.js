// verificationRoutes.js
const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");

// Verification routes
router.get("/pending", verificationController.getPendingVerifications);
router.put("/:userType/:userId", verificationController.verifyDriverLicense);
router.put("/allcars/cars/:carId", verificationController.verifyCarDocuments);
router.get("/status/:userId", verificationController.getVerificationStatus);

module.exports = router;
