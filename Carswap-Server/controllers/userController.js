const UserModel = require("../models/userModel");
const SubscriptionPaymentModel = require("../models/subscriptionPaymentModel");
const axios = require("axios");
require("dotenv").config();

const userController = {
  // Basic CRUD operations
  getAllUsers: async (req, res) => {
    try {
      const result = await UserModel.getAllUsers();
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  getUserByEmail: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.getUserByEmail(email);
      result
        ? res.status(200).json(result)
        : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createUser: async (req, res) => {
    try {
      const user = req.body;
      const existingUser = await UserModel.getUserByEmail(user.email);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await UserModel.createUser(user);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await UserModel.deleteUser(id);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  updateUserByEmail: async (req, res) => {
    try {
      const email = req.params.email;
      const updateData = req.body;
      const result = await UserModel.updateUserByEmail(email, updateData);
      result.modifiedCount === 1
        ? res
            .status(200)
            .json({ success: true, message: "User updated successfully" })
        : res.status(404).json({
            success: false,
            message: "User not found or no changes made",
          });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  // Role checking
  checkAdminStatus: async (req, res) => {
    await checkRole(req, res, "admin");
  },

  checkOwnerStatus: async (req, res) => {
    await checkRole(req, res, "owner");
  },

  checkRenterStatus: async (req, res) => {
    await checkRole(req, res, "renter");
  },

  // Verification related
  initiateVerification: async (req, res) => {
    try {
      const { email, verificationData } = req.body;
      const requiredFields = [
        "licenseNumber",
        "nid",
        "licenseImage",
        "nidPhoto",
      ];

      if (!email || !verificationData) {
        return res
          .status(400)
          .json({ error: "Missing required verification data" });
      }

      if (requiredFields.some((field) => !verificationData[field])) {
        return res
          .status(400)
          .json({ error: "Missing required verification fields" });
      }

      const updateResult = await UserModel.updateUserByEmail(email, {
        verificationData: {
          ...verificationData,
          status: "pending",
          submittedAt: new Date().toISOString(),
        },
      });

      if (!updateResult.modifiedCount && !updateResult.upsertedCount) {
        throw new Error("Failed to save verification data");
      }

      const transactionId =
        "VERIFY_" + Date.now() + "_" + email.replace(/[^a-zA-Z0-9]/g, "_");

      // Use SubscriptionPaymentModel instead of PaymentModel
      await SubscriptionPaymentModel.createPayment({
        userEmail: email,
        amount: 100,
        purpose: "verification",
        status: "initiated",
        transactionId,
        verificationData,
      });

      const paymentData = new URLSearchParams({
        store_id: process.env.SSLCOMMERZ_STORE_ID,
        store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
        total_amount: "100.00",
        currency: "BDT",
        tran_id: transactionId,

        success_url: `${
          process.env.BACKEND_URL
        }/users/verify-success?tran_id=${transactionId}&amount=100&email=${encodeURIComponent(
          email
        )}`,
        fail_url: `${
          process.env.BACKEND_URL
        }/users/verify-failed?tran_id=${transactionId}&email=${encodeURIComponent(
          email
        )}`,
        cancel_url: `${
          process.env.BACKEND_URL
        }/users/verify-cancelled?tran_id=${transactionId}&email=${encodeURIComponent(
          email
        )}`,
        ipn_url: `${process.env.BACKEND_URL}/users/verify-ipn`,
        cus_name: verificationData.name || "Customer",
        cus_email: email,
        cus_phone: verificationData.phone || "01700000000",
        cus_add1: "Account Verification",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: "Account Verification Fee",
        product_category: "Service",
        product_profile: "general",
      });

      const response = await axios.post(
        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        paymentData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.data.status !== "SUCCESS") {
        throw new Error(
          "Payment initiation failed: " + response.data.failedreason
        );
      }

      res.json({
        success: true,
        paymentUrl: response.data.GatewayPageURL,
        transactionId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  handleVerificationIPN: async (req, res) => {
    try {
      const { tran_id, status, val_id } = req.body;

      if (status !== "VALID") {
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      const email = extractEmailFromTransactionId(tran_id);
      if (!email) {
        return res.status(400).json({ error: "Invalid transaction ID format" });
      }

      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;
      const verifyResponse = await axios.get(verifyUrl);

      if (verifyResponse.data.status !== "VALID") {
        return res.status(400).json({ error: "Payment verification failed" });
      }

      // Use SubscriptionPaymentModel instead of PaymentModel
      await SubscriptionPaymentModel.updatePaymentStatusByTransactionId(
        tran_id,
        "completed",
        val_id
      );

      await UserModel.updateUserByEmail(email, {
        isSubscribed: true,
        "verificationData.status": "pending",
        "verificationData.paymentDate": new Date().toISOString(),
        "verificationData.transactionId": tran_id,
      });

      await updateAdminBalance(email, tran_id, 100);

      res
        .status(200)
        .json({ success: true, message: "IPN processed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  handleVerificationCallback: async (req, res) => {
    try {
      const { tran_id, amount, email } = req.query;
      // More robust status extraction
      const pathParts = req.path.split("/");
      const status = pathParts[pathParts.length - 1].split("-").pop();

      if (!["success", "failed", "cancelled"].includes(status)) {
        throw new Error("Invalid payment status");
      }

      const frontendUrl = process.env.FRONTEND_URL;

      if (tran_id) {
        await SubscriptionPaymentModel.updatePaymentStatusByTransactionId(
          tran_id,
          status
        );
      }

      if (status === "success") {
        await updateAdminBalance(email, tran_id, amount);
        await UserModel.updateUserByEmail(email, {
          isSubscribed: true,
          "verificationData.paymentDate": new Date().toISOString(),
          "verificationData.transactionId": tran_id,
        });
      }

      res.redirect(
        `${frontendUrl}/payment-result?payment=${status}&email=${encodeURIComponent(
          email
        )}&tran_id=${tran_id || ""}&amount=${amount || ""}`
      );
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/payment-result?payment=error&error=${encodeURIComponent(
          error.message
        )}`
      );
    }
  },

  handleVerificationIPN: async (req, res) => {
    try {
      const { tran_id, status, val_id } = req.body;

      if (status !== "VALID") {
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      const email = extractEmailFromTransactionId(tran_id);
      if (!email) {
        return res.status(400).json({ error: "Invalid transaction ID format" });
      }

      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;
      const verifyResponse = await axios.get(verifyUrl);

      if (verifyResponse.data.status !== "VALID") {
        return res.status(400).json({ error: "Payment verification failed" });
      }

      await PaymentModel.updatePaymentStatusByTransactionId(
        tran_id,
        "completed",
        val_id
      );

      await UserModel.updateUserByEmail(email, {
        isSubscribed: true,
        "verificationData.status": "pending",
        "verificationData.paymentDate": new Date().toISOString(),
        "verificationData.transactionId": tran_id,
      });

      await updateAdminBalance(email, tran_id, 100);

      res
        .status(200)
        .json({ success: true, message: "IPN processed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  approveVerification: async (req, res) => {
    try {
      const { email } = req.params;
      const { adminNotes } = req.body;

      const result = await UserModel.updateUserByEmail(email, {
        "verificationData.status": "approved",
        "verificationData.verifiedAt": new Date().toISOString(),
        adminNotes,
        isSubscribed: true,
      });

      result.modifiedCount === 1
        ? res.json({ success: true, message: "Verification approved" })
        : res.status(404).json({ success: false, message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  rejectVerification: async (req, res) => {
    try {
      const { email } = req.params;
      const { adminNotes } = req.body;

      const result = await UserModel.updateUserByEmail(email, {
        "verificationData.status": "rejected",
        "verificationData.rejectedAt": new Date().toISOString(),
        adminNotes,
      });

      result.modifiedCount === 1
        ? res.json({ success: true, message: "Verification rejected" })
        : res.status(404).json({ success: false, message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPendingVerifications: async (req, res) => {
    try {
      const pendingVerifications = await UserModel.getPendingVerifications();
      res.json(pendingVerifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Balance operations
  updateUserBalance: async (req, res) => {
    try {
      const { email } = req.params;
      const { amount, type, description } = req.body;

      const result = await UserModel.updateUserBalance(
        email,
        amount,
        type,
        description
      );
      res.json({
        success: true,
        newBalance: result.balance,
        transaction: result.transaction,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserBalance: async (req, res) => {
    try {
      const { email } = req.params;
      const user = await UserModel.getUserByEmail(email);
      res.json({
        success: true,
        balance: user.balance || 0,
        transactions: user.transactions || [],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAdminBalance: async (req, res) => {
    try {
      const { amount, transactionId, userEmail } = req.body;
      const result = await UserModel.updateUserBalance(
        "carswap@gmail.com",
        amount,
        "credit",
        `Payment from ${
          userEmail || "unknown user"
        } (Transaction: ${transactionId})`
      );
      res.json({ success: true, newBalance: result.balance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

// Helper functions
async function checkRole(req, res, role) {
  try {
    const email = req.params.email;
    const result = await UserModel.checkRoleStatus(email, role);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

function extractEmailFromTransactionId(tran_id) {
  const parts = tran_id.split("_");
  if (parts.length >= 4) {
    return parts[2] + "@" + parts[3];
  }
  const emailPart = parts.slice(2).join("_");
  return emailPart.replace("_", "@");
}

async function updateAdminBalance(userEmail, transactionId, amount) {
  await UserModel.updateUserBalance(
    "carswap@gmail.com",
    amount,
    "credit",
    `Verification fee from ${userEmail} (Transaction: ${transactionId})`
  );
}

module.exports = userController;
