const { connectToDatabase, getObjectId } = require("../config/db");

class WithdrawalModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapWithdrawals");
  }

  static async createWithdrawal(withdrawalData) {
    const collection = await this.getCollection();
    withdrawalData.status = "pending";
    withdrawalData.createdAt = new Date();
    withdrawalData.updatedAt = new Date();
    const result = await collection.insertOne(withdrawalData);
    return { ...withdrawalData, _id: result.insertedId };
  }

  static async getWithdrawalById(withdrawalId) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(withdrawalId) });
  }

  static async getWithdrawalsByOwner(ownerEmail) {
    const collection = await this.getCollection();
    return collection.find({ ownerEmail }).sort({ createdAt: -1 }).toArray();
  }

  static async getPendingWithdrawals() {
    const collection = await this.getCollection();
    return collection.find({ status: "pending" }).sort({ createdAt: 1 }).toArray();
  }

  static async approveWithdrawal(withdrawalId, adminNotes = "") {
    const collection = await this.getCollection();
    const withdrawal = await this.getWithdrawalById(withdrawalId);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("Withdrawal is not in pending state");
    }

    // Update admin balance (deduct 90% of the amount)
    await UserModel.updateUserBalance(
      "carswap@gmail.com",
      withdrawal.amount * 0.9,
      "debit",
      `Withdrawal approved for ${withdrawal.ownerEmail} (Withdrawal ID: ${withdrawalId})`
    );

    // Update owner balance (deduct 10% as fee)
    await UserModel.updateUserBalance(
      withdrawal.ownerEmail,
      withdrawal.amount * 0.1,
      "debit",
      `Withdrawal fee for withdrawal ID: ${withdrawalId}`
    );

    const result = await collection.updateOne(
      { _id: getObjectId(withdrawalId) },
      {
        $set: {
          status: "completed",
          updatedAt: new Date(),
          completedAt: new Date(),
          adminNotes,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update withdrawal status");
    }

    return this.getWithdrawalById(withdrawalId);
  }

  static async rejectWithdrawal(withdrawalId, adminNotes = "") {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: getObjectId(withdrawalId) },
      {
        $set: {
          status: "rejected",
          updatedAt: new Date(),
          rejectedAt: new Date(),
          adminNotes,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update withdrawal status");
    }

    return this.getWithdrawalById(withdrawalId);
  }
}

module.exports = WithdrawalModel;