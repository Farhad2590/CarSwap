const { connectToDatabase, getObjectId } = require("../config/db");

class VerificationModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapUser");
  }

  static async getPendingVerifications() {
    const collection = await this.getCollection();

    return collection.find({ "verificationData.status": "pending" }).toArray();
  }

  static async verifyDriverLicense(userId, userType, status, adminNotes) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(userId), userType: userType },
      {
        $set: {
          verificationStatus: "Verified",
          "verificationData.status": status,
          adminNotes,
          verifiedAt: new Date().toDateString(),
        },
      },
      { upsert: true }
    );
  }

  static async verifyCarDocuments(carId, status, adminNotes) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { carId: getObjectId(carId), type: "owner" },
      { $set: { status, adminNotes, verifiedAt: new Date() } },
      { upsert: true }
    );
  }

  static async getVerificationStatus(userId) {
    const collection = await this.getCollection();
    return collection.findOne(
      { userId: getObjectId(userId), type: "driver" },
      { projection: { status: 1, verifiedAt: 1 } }
    );
  }
}

module.exports = VerificationModel;
