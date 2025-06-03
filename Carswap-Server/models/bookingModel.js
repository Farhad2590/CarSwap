const { connectToDatabase, getObjectId } = require("../config/db");

class BookingModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapBookings");
  }

  static async createBooking(bookingData) {
    const collection = await this.getCollection();
    bookingData.status = "pending_acceptance";
    bookingData.createdAt = new Date();
    bookingData.updatedAt = new Date();
    bookingData.advanceAmount = bookingData.estimatedTotal * 0.5; // 50% advance
    const result = await collection.insertOne(bookingData);
    return { ...bookingData, _id: result.insertedId };
  }

  static async getBookingDetails(bookingId) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(bookingId) });
  }

  static async acceptBooking(bookingId) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "payment_pending",
          updatedAt: new Date(),
          acceptedAt: new Date(),
        },
      }
    );
  }

  static async rejectBooking(bookingId, rejectionReason) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || "Not specified",
        },
      }
    );
  }

  static async markAdvancePaid(bookingId, paymentDetails) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "advance_paid",
          updatedAt: new Date(),
          paymentDetails,
          advancePaidAt: new Date(),
        },
      }
    );
  }

  static async setPickupDetails(bookingId, pickupDetails) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "ready_for_pickup",
          updatedAt: new Date(),
          pickupDetails,
        },
      }
    );
  }

  static async markPickedUp(bookingId, finalPaymentDetails) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "picked_up",
          updatedAt: new Date(),
          finalPaymentDetails,
          pickedUpAt: new Date(),
        },
      }
    );
  }

  static async markDelivered(bookingId) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "car_delivered",
          updatedAt: new Date(),
          deliveredAt: new Date(),
        },
      }
    );
  }

  static async completeBooking(bookingId, reviewDetails) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: reviewDetails ? "reviewed" : "completed",
          updatedAt: new Date(),
          completedAt: new Date(),
          reviewDetails,
        },
      }
    );
  }

  static async getUserBookings(userEmail) {
    const collection = await this.getCollection();
    return collection
      .find({
        $or: [{ renterEmail: userEmail }, { ownerEmail: userEmail }],
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async markPickedAndPaymentDone(bookingId) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bookingId) },
      {
        $set: {
          status: "picked_and_payment_done",
          updatedAt: new Date(),
          paymentCompletedAt: new Date(),
        },
      }
    );
  }

  static async getOwnerBookings(ownerEmail) {
    const collection = await this.getCollection();
    return collection.find({ ownerEmail }).sort({ createdAt: -1 }).toArray();
  }
}

module.exports = BookingModel;
