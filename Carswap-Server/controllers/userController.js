const UserModel = require("../models/userModel");
const PaymentModel = require("../models/paymentModel");
const axios = require("axios");
require("dotenv").config();

console.log("Store ID:", "carsw683bc46e1ae21");
console.log("Store Pass:", "carsw683bc46e1ae21@ssl" ? "***" : "Not set");
console.log("Frontend URL:", "http://localhost:5173");
console.log("Backend URL:", "http://localhost:9000");

const userController = {
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
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
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

  updateUserRole: async (req, res) => {
    try {
      const userEmail = req.params.email;
      const { role } = req.body;
      const result = await UserModel.updateUserRole(userEmail, role);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  checkAdminStatus: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.checkAdminStatus(email);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  checkOwnerStatus: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.checkOwnerStatus(email);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  checkRenterStatus: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.checkRenterStatus(email);
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
      if (result.modifiedCount === 1) {
        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
      } else {
        res.status(404).json({
          success: false,
          message: "User not found or no changes made",
        });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  initiateVerification: async (req, res) => {
    try {
      const { email, verificationData } = req.body;


      if (!email || !verificationData) {
        return res
          .status(400)
          .json({ error: "Missing required verification data" });
      }


      const { licenseNumber, nid, licenseImage, nidPhoto } = verificationData;
      if (!licenseNumber || !nid || !licenseImage || !nidPhoto) {
        return res
          .status(400)
          .json({ error: "Missing required verification fields" });
      }


      if (!"carsw683bc46e1ae21" || !"carsw683bc46e1ae21@ssl") {
        console.error(
          "SSLCommerz credentials not found in environment variables"
        );
        return res
          .status(500)
          .json({ error: "Payment gateway configuration error" });
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
        "VERIFY_" +
        Date.now() +
        "_" +
        email.replace("@", "_").replace(".", "_");


      const paymentData = new URLSearchParams({
        store_id: "carsw683bc46e1ae21",
        store_passwd: "carsw683bc46e1ae21@ssl",
        total_amount: "100.00",
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard/profile`,
        fail_url: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard/profile`,
        cancel_url: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard/profile`,
        ipn_url: `${
          process.env.BACKEND_URL || "http://localhost:9000"
        }/api/users/verify-ipn`,
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

      const paymentRecord = await PaymentModel.createPayment({
        userEmail: email,
        amount: 100,
        purpose: "verification",
        status: "initiated",
        transactionId,
        verificationData,
      });


      const response = await axios.post(
        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        paymentData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.status !== "SUCCESS") {
        throw new Error(
          "Payment initiation failed: " + response.data.failedreason
        );
      }

      res.json({
        success: true,
        paymentUrl: response.data.GatewayPageURL,
        transactionId: transactionId,
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        error: error.message,
        details: error.response?.data || "Unknown error occurred",
      });
    }
  },

  handleVerificationIPN: async (req, res) => {
    try {
      const { tran_id, status, val_id } = req.body;

      if (status !== "VALID") {
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      const parts = tran_id.split("_");
      if (parts.length < 3) {
        return res.status(400).json({ error: "Invalid transaction ID format" });
      }

      const emailPart = parts.slice(2).join("_").replace("_", "@");
      const email = emailPart.includes("@")
        ? emailPart
        : parts[2] + "@" + parts[3];

      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${"carsw683bc46e1ae21"}&store_passwd=${"carsw683bc46e1ae21@ssl"}&format=json`;

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

      res.json({ success: true });
    } catch (error) {
      console.error("IPN handling error:", error);
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

      if (result.modifiedCount === 1) {
        res.json({ success: true, message: "Verification approved" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
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

      if (result.modifiedCount === 1) {
        res.json({ success: true, message: "Verification rejected" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
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
};

module.exports = userController;
