const { connectToDatabase, getObjectId } = require('../config/db');

class ReviewModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection('reviews');
  }

  static async createReview(reviewData) {
    const collection = await this.getCollection();
    reviewData.createdAt = new Date();
    const result = await collection.insertOne(reviewData);
    return { ...reviewData, _id: result.insertedId };
  }

  static async getCarReviews(carId) {
    const collection = await this.getCollection();
    return collection.find({ carId: getObjectId(carId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getOwnerReviews(ownerId) {
    const collection = await this.getCollection();
    return collection.aggregate([
      { $match: { ownerId: getObjectId(ownerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviews: { $push: "$$ROOT" }
        }
      }
    ]).toArray();
  }

  static async getRenterReviews(renterId) {
    const collection = await this.getCollection();
    return collection.aggregate([
      { $match: { renterId: getObjectId(renterId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviews: { $push: "$$ROOT" }
        }
      }
    ]).toArray();
  }
}

module.exports = ReviewModel;