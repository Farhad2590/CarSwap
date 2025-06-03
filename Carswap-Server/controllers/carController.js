const CarModel = require('../models/carModel');
const UserModel = require('../models/userModel');

const carController = {
  createCarPost: async (req, res) => {
    try {
      const carData = req.body;
      carData.status = 'pending'; 
      carData.createdAt = new Date().toISOString();
      carData.updatedAt = new Date().toISOString();
      carData.ratings = [];
      const result = await CarModel.createCarPost(carData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllCarPosts: async (req, res) => {
    try {
      const { status } = req.query;
      const filter = status ? { status } : {};
      
    
      const carPosts = await CarModel.getAllCarPosts(filter);
      
    
      const carPostsWithVerification = await Promise.all(
        carPosts.map(async (car) => {
          try {
            const user = await UserModel.getUserByEmail(car.userEmail);
            const verificationStatus = user?.verificationData?.status === 'approved' ? 'verified' : 'unverified';
            return {
              ...car,
              verificationStatus
            };
          } catch (error) {
            console.error(`Error getting user verification for ${car.userEmail}:`, error);
            return {
              ...car,
              verificationStatus: 'unverified'
            };
          }
        })
      );

     
      const sortedCarPosts = carPostsWithVerification.sort((a, b) => {
     
        if (a.verificationStatus === 'verified' && b.verificationStatus === 'unverified') {
          return -1;
        }
        if (a.verificationStatus === 'unverified' && b.verificationStatus === 'verified') {
          return 1;
        }
       
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.json(sortedCarPosts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCarPostById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await CarModel.getCarPostById(id);
      if (result) {
       
        try {
          const user = await UserModel.getUserByEmail(result.userEmail);
          const verificationStatus = user?.verificationData?.status === 'approved' ? 'verified' : 'unverified';
          result.verificationStatus = verificationStatus;
        } catch (error) {
          result.verificationStatus = 'unverified';
        }
        res.json(result);
      } else {
        res.status(404).json({ message: 'Car post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCarPost: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      updateData.updatedAt = new Date().toISOString();
      const result = await CarModel.updateCarPost(id, updateData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteCarPost: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await CarModel.deleteCarPost(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCarsByOwner: async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      const { status } = req.query;
      
    
      const filter = { userEmail: ownerEmail };
      if (status) {
        filter.status = status;
      }
      
      const result = await CarModel.getCarsByOwner(filter);
      
      
      try {
        const user = await UserModel.getUserByEmail(ownerEmail);
        const verificationStatus = user?.verificationData?.status === 'approved' ? 'verified' : 'unverified';
        
       
        const carsWithVerification = result.map(car => ({
          ...car,
          verificationStatus
        }));
        
        res.json(carsWithVerification);
      } catch (error) {
       
        const carsWithVerification = result.map(car => ({
          ...car,
          verificationStatus: 'unverified'
        }));
        res.json(carsWithVerification);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  approveCarPost: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        status: "approved",
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await CarModel.updateCarPost(id, updateData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  rejectCarPost: async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const updateData = {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejectionReason: rejectionReason || "Not specified",
        updatedAt: new Date().toISOString()
      };
      const result = await CarModel.updateCarPost(id, updateData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  verifyCarLicense: async (req, res) => {
    try {
      const { id } = req.params;
      const { licenseVerified } = req.body;
      const result = await CarModel.verifyCarLicense(id, licenseVerified);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  placeBid: async (req, res) => {
    try {
      const { id } = req.params;
      const bidData = req.body;
      bidData.createdAt = new Date().toISOString();
      bidData.status = 'pending';
      const result = await CarModel.placeBid(id, bidData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getBidsForCar: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await CarModel.getBidsForCar(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  acceptBid: async (req, res) => {
    try {
      const { bidId } = req.params;
      const result = await CarModel.acceptBid(bidId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  
  getUserVerificationStatus: async (req, res) => {
    try {
      const { email } = req.params;
      const user = await UserModel.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const verificationStatus = {
        isVerified: user.verificationData?.status === 'approved',
        status: user.verificationData?.status || 'not_submitted',
        verificationData: user.verificationData || null
      };

      res.json(verificationStatus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = carController;