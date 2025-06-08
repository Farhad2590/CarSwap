const { connectToDatabase, getObjectId } = require("../config/db");

class BookingPaymentModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapBookingPayments");
  }

  static async createPayment(paymentData) {
    const collection = await this.getCollection();
    paymentData.createdAt = new Date();
    paymentData.updatedAt = new Date();
    const result = await collection.insertOne(paymentData);
    return { ...paymentData, _id: result.insertedId };
  }

  static async updatePaymentStatusByTransactionId(transactionId, status, valId = null) {
    const collection = await this.getCollection();
    const updateData = {
      $set: {
        status,
        updatedAt: new Date()
      }
    };

    if (valId) {
      updateData.$set.valId = valId;
    }

    return collection.updateOne(
      { transactionId },
      updateData
    );
  }

  static async recordCashPayment(bookingId, amount) {
    const collection = await this.getCollection();
    const payment = {
      bookingId: getObjectId(bookingId),
      amount,
      status: "completed",
      paymentMethod: "cash",
      type: "cash",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(payment);
    return { ...payment, _id: result.insertedId };
  }

  static async getPaymentsByBooking(bookingId) {
    const collection = await this.getCollection();
    return collection.find({ bookingId: getObjectId(bookingId) }).toArray();
  }

  static async getAllPayments() {
    const collection = await this.getCollection();
    return collection.find({}).toArray();
  }

  static async getPaymentsByUser(email) {
    const collection = await this.getCollection();
    return collection.find({ userEmail: email }).toArray();
  }

  static async distributeOwnerPayment(bookingId) {
    const collection = await this.getCollection();
    await collection.updateOne(
      { bookingId: getObjectId(bookingId), type: "advance" },
      { $set: { status: "distributed", updatedAt: new Date() } }
    );
    return true;
  }
}

module.exports = BookingPaymentModel;