const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawalController");

// Withdrawal routes
router.post("/", withdrawalController.createWithdrawal);
router.get("/owner/:ownerEmail", withdrawalController.getWithdrawalsByOwner);
router.get("/pending", withdrawalController.getPendingWithdrawals);
router.put("/:withdrawalId/approve", withdrawalController.approveWithdrawal);
router.put("/:withdrawalId/reject", withdrawalController.rejectWithdrawal);

module.exports = router;