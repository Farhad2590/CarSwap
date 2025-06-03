const { connectToDatabase, getObjectId } = require('../config/db');

class SubscriptionModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection('subscriptions');
  }

  static async createSubscriptionPlan(planData) {
    const collection = await this.getCollection();
    const result = await collection.insertOne(planData);
    return { ...planData, _id: result.insertedId };
  }

  static async getAllSubscriptionPlans() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  static async subscribeUser(userId, subscriptionData) {
    const collection = await this.getCollection();
    const userCollection = await connectToDatabase().then(db => db.collection('carSwapUser'));
    

    await userCollection.updateOne(
      { _id: getObjectId(userId) },
      { $set: { subscription: subscriptionData } }
    );

    return { success: true };
  }

  static async getUserSubscriptionStatus(userId) {
    const collection = await connectToDatabase().then(db => db.collection('carSwapUser'));
    const user = await collection.findOne(
      { _id: getObjectId(userId) },
      { projection: { subscription: 1 } }
    );
    return user?.subscription || null;
  }

  static async verifySubscriptionUser(userId, isVerified) {
    const collection = await connectToDatabase().then(db => db.collection('carSwapUser'));
    return collection.updateOne(
      { _id: getObjectId(userId) },
      { $set: { 'subscription.verified': isVerified } }
    );
  }
}

module.exports = SubscriptionModel;