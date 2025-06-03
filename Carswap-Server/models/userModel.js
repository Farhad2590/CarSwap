const { connectToDatabase, getObjectId } = require("../config/db");

class UserModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapUser");
  }

  static async getAllUsers() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  static async getUserByEmail(email) {
    const collection = await this.getCollection();
    return collection.findOne({ email });
  }

  static async getUserById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(id) });
  }

  static async createUser(user) {
    const collection = await this.getCollection();
    return collection.insertOne(user);
  }

  static async deleteUser(id) {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: getObjectId(id) });
  }

  static async updateUserRole(email, role) {
    const collection = await this.getCollection();
    return collection.updateOne({ email }, { $set: { role } });
  }

  static async checkAdminStatus(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { admin: user?.userType === "admin" };
  }

  static async checkOwnerStatus(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { owner: user?.userType === "owner" };
  }

  static async checkRenterStatus(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { renter: user?.userType === "renter" };
  }

  static async updateUserByEmail(email, updateData) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { email },
      { $set: updateData },
      { upsert: true }
    );
  }

  static async getPendingVerifications() {
    const collection = await this.getCollection();
    return collection
      .find({
        "verificationData.status": "pending",
      })
      .toArray();
  }
}

module.exports = UserModel;