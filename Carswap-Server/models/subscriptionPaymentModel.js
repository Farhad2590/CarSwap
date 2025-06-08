const { connectToDatabase, getObjectId } = require("../config/db");

class SubscriptionPaymentModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapPayments");
  }

  static async createPayment(paymentData) {
    const collection = await this.getCollection();
    paymentData.createdAt = new Date();
    paymentData.updatedAt = new Date();
    const result = await collection.insertOne(paymentData);
    return { ...paymentData, _id: result.insertedId };
  }

  static async getPaymentsByUser(email) {
    const collection = await this.getCollection();
    return collection.find({ userEmail: email }).toArray();
  }

  static async getAllPayments() {
    const collection = await this.getCollection();
    return collection.find({}).toArray();
  }

  static async updatePaymentStatusByTransactionId(
    transactionId,
    status,
    valId = null
  ) {
    const collection = await this.getCollection();
    const updateData = {
      status,
      updatedAt: new Date(),
    };
    if (valId) updateData.valId = valId;

    return collection.updateOne({ transactionId }, { $set: updateData });
  }
}

module.exports = SubscriptionPaymentModel;