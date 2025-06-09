const { connectToDatabase, getObjectId } = require("../config/db");

class CarModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("carSwapCars");
  }

  static async createCarPost(carData) {
    const collection = await this.getCollection();
    const result = await collection.insertOne(carData);
    return { ...carData, _id: result.insertedId };
  }

  static async getAllCarPosts(filter = {}) {
    const collection = await this.getCollection();
    return collection.find(filter).toArray();
  }

  static async getCarPostById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(id) });
  }

  static async updateCarPost(id, updateData) {
    const collection = await this.getCollection();
    return collection.updateOne({ _id: getObjectId(id) }, { $set: updateData });
  }

  static async deleteCarPost(id) {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: getObjectId(id) });
  }

  static async getCarsByOwner(filter) {
    const collection = await this.getCollection();
    return collection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  static async approveCarPost(id) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(id) },
      {
        $set: {
          status: "approved",
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  static async verifyCarLicense(id, licenseVerified) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(id) },
      {
        $set: {
          licenseVerified,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  static async placeBid(carId, bidData) {
    const collection = await this.getCollection();
    // Add unique bid ID and timestamp
    const bidWithId = {
      ...bidData,
      _id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    return collection.updateOne(
      { _id: getObjectId(carId) },
      {
        $push: { bids: bidWithId },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
  }

  static async getBidsForCar(carId) {
    const collection = await this.getCollection();
    const car = await collection.findOne(
      { _id: getObjectId(carId) },
      { projection: { bids: 1 } }
    );
    return car?.bids || [];
  }

  static async acceptBid(bidId) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { "bids._id": bidId },
      {
        $set: {
          "bids.$.status": "accepted",
          "bids.$.acceptedAt": new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  // Get pending car posts for admin review
  static async getPendingCarPosts() {
    const collection = await this.getCollection();
    return collection
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Get approved car posts
  static async getApprovedCarPosts() {
    const collection = await this.getCollection();
    return collection
      .find({ status: "approved" })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Get rejected car posts
  static async getRejectedCarPosts() {
    const collection = await this.getCollection();
    return collection
      .find({ status: "rejected" })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Search car posts with filters
  static async searchCarPosts(searchFilters) {
    const collection = await this.getCollection();
    const filter = { ...searchFilters };

    // Only show approved posts in search
    if (!filter.status) {
      filter.status = "approved";
    }

    return collection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  static async addCarReview(carId, reviewData) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: getObjectId(carId) },
      {
        $push: { reviews: reviewData },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
    return result;
  }

  static async getCarReviews(carId) {
    const collection = await this.getCollection();
    const car = await collection.findOne(
      { _id: getObjectId(carId) },
      { projection: { reviews: 1 } }
    );
    return car?.reviews || [];
  }

  // Get cars by location
  static async getCarsByLocation(location) {
    const collection = await this.getCollection();
    return collection
      .find({
        posting_location: { $regex: location, $options: "i" },
        status: "approved",
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Get featured cars (you can define your own logic for what makes a car featured)
  static async getFeaturedCars(limit = 10) {
    const collection = await this.getCollection();
    return collection
      .find({
        status: "approved",
      })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .toArray();
  }

  static async getReviewsByReviewer(reviewerEmail) {
    const collection = await this.getCollection();
    const cars = await collection
      .find({ "reviews.reviewerEmail": reviewerEmail })
      .toArray();

    // Extract and flatten all reviews from matching cars
    const reviews = [];
    cars.forEach((car) => {
      if (car.reviews && car.reviews.length > 0) {
        const carReviews = car.reviews
          .filter((review) => review.reviewerEmail === reviewerEmail)
          .map((review) => ({
            ...review,
            carId: car._id,
            carMake: car.car_details?.car_make,
            carModel: car.car_details?.car_model,
          }));
        reviews.push(...carReviews);
      }
    });

    return reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  static async getReviewsForOwner(ownerEmail) {
    const collection = await this.getCollection();
    const cars = await collection
      .find({ userEmail: ownerEmail, reviews: { $exists: true, $ne: [] } })
      .toArray();

    // Extract and flatten all reviews from owner's cars
    const reviews = [];
    cars.forEach((car) => {
      if (car.reviews && car.reviews.length > 0) {
        const carReviews = car.reviews.map((review) => ({
          ...review,
          carId: car._id,
          carMake: car.car_details?.car_make,
          carModel: car.car_details?.car_model,
        }));
        reviews.push(...carReviews);
      }
    });

    return reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  static async getAllReviews() {
    const collection = await this.getCollection();
    const cars = await collection
      .find({ reviews: { $exists: true, $ne: [] } })
      .toArray();

    // Extract and flatten all reviews from all cars
    const reviews = [];
    cars.forEach((car) => {
      if (car.reviews && car.reviews.length > 0) {
        const carReviews = car.reviews.map((review) => ({
          ...review,
          carId: car._id,
          carMake: car.car_details?.car_make,
          carModel: car.car_details?.car_model,
          ownerEmail: car.userEmail,
        }));
        reviews.push(...carReviews);
      }
    });

    return reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}

module.exports = CarModel;
