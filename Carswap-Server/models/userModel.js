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

  static async checkRoleStatus(email, role) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { [role]: user?.userType === role };
  }

  static async updateUserByEmail(email, updateData) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { email },
      { $set: updateData },
      { upsert: true }
    );
  }

  static async updateUserBalance(email, amount, type, description) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    let currentBalance = 0;
    if (user.balance !== undefined && user.balance !== null) {
      if (typeof user.balance === 'object' && user.balance.$numberLong) {
        currentBalance = parseInt(user.balance.$numberLong);
      } else {
        currentBalance = Number(user.balance);
      }
    }

    const newBalance = type === "credit" ? 
      currentBalance + Number(amount) : 
      currentBalance - Number(amount);

    if (type === "debit" && newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    const transaction = {
      amount: Number(amount),
      type,
      description,
      date: new Date().toISOString(),
      newBalance,
      previousBalance: currentBalance
    };

    const result = await collection.updateOne(
      { email },
      {
        $set: { balance: newBalance },
        $push: {
          transactions: {
            $each: [transaction],
            $position: 0,
            $slice: 100
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update user balance");
    }

    return { balance: newBalance, transaction };
  }

  static async getPendingVerifications({ limit = 100, skip = 0 } = {}) {
    const collection = await this.getCollection();
    return collection
      .find({ "verificationData.status": "pending" })
      .sort({ "verificationData.submittedAt": 1 })
      .skip(skip)
      .limit(limit)
      .project({
        _id: 1,
        email: 1,
        verificationData: 1,
      })
      .toArray();
  }

  static async ensureAdminUser(adminEmail) {
    const collection = await this.getCollection();
    const admin = await collection.findOne({ email: adminEmail });
    
    if (!admin) {
      await collection.insertOne({
        email: adminEmail,
        name: "Admin User",
        userType: "admin",
        balance: 0,
        transactions: [],
        createdAt: new Date().toISOString()
      });
      return await collection.findOne({ email: adminEmail });
    }
    
    if (admin.balance === undefined || admin.balance === null || !admin.transactions) {
      await collection.updateOne(
        { email: adminEmail },
        { 
          $set: { 
            balance: admin.balance || 0,
            transactions: admin.transactions || []
          }
        }
      );
      return await collection.findOne({ email: adminEmail });
    }
    
    return admin;
  }
}

module.exports = UserModel;