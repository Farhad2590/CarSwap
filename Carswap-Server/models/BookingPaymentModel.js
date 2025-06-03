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

    static async getPaymentsByBooking(bookingId) {
        const collection = await this.getCollection();
        return collection.find({ bookingId: getObjectId(bookingId) }).toArray();
    }

    static async getPaymentsByUser(userEmail) {
        const collection = await this.getCollection();
        return collection.find({ userEmail }).toArray();
    }
}

module.exports = BookingPaymentModel;