import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  X,
  MapPin,
  Phone,
  CreditCard,
  Upload,
  Shield,
} from "lucide-react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BookingModal = ({ isOpen, onClose, car, owner }) => {
  const imgbbApi = "41a71049f5f8bd040846fcf2d7168ed2";
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [biddingData, setBiddingData] = useState({
    // Rental Period
    startDate: "",
    endDate: "",
    pickupTime: "",
    dropoffTime: "",

    // Renter Information
    renterName: "",
    renterPhone: user?.phone || "",
    renterEmail: user?.email || "",
    renterAddress: "",
    renterAge: "",
    renterLicense: "",

    // Document uploads (only for non-verified users)
    drivingLicenseImage: null,
    nidImage: null,

    // Pickup/Dropoff Details
    pickupLocation: "",
    dropoffLocation: "",

    // Rental Requirements
    specialRequests: "",

    // Payment Process
    paymentMethod: "50_advance",

    // Agreement
    agreeToTerms: false,

    // Additional Info
    previousRentalExperience: false,
    estimatedMileage: "",
    purposeOfRental: "",
  });

  // Check user verification status
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user?.email) return;

      try {
        setIsCheckingVerification(true);
        const response = await axios.get(
          `http://localhost:9000/users/${user.email}`
        );
        const verificationStatus = response.data.verificationStatus;
        setIsVerified(verificationStatus === "Verified");
      } catch (error) {
        console.error("Error checking verification status:", error);
        setIsVerified(false);
      } finally {
        setIsCheckingVerification(false);
      }
    };

    if (isOpen && user?.email) {
      checkVerificationStatus();
    }
  }, [isOpen, user?.email]);

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload only JPG, JPEG, or PNG images");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setBiddingData({ ...biddingData, [fieldName]: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation for non-verified users
    if (!isVerified) {
      if (!biddingData.drivingLicenseImage || !biddingData.nidImage) {
        toast.error("Please upload both Driving License and NID images");
        setIsSubmitting(false);
        return;
      }
    }

    // Additional validation
    if (!biddingData.startDate || !biddingData.endDate) {
      toast.error("Please select both start and end dates");
      setIsSubmitting(false);
      return;
    }

    if (new Date(biddingData.endDate) <= new Date(biddingData.startDate)) {
      toast.error("End date must be after start date");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload documents first if needed
      let drivingLicenseUrl = "";
      let nidUrl = "";

      if (!isVerified) {
        if (biddingData.drivingLicenseImage) {
          const formDataImg = new FormData();
          formDataImg.append("image", biddingData.drivingLicenseImage);

          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
            {
              method: "POST",
              body: formDataImg,
            }
          );

          const result = await response.json();
          if (result.success) {
            drivingLicenseUrl = result.data.url;
          }
        }

        if (biddingData.nidImage) {
          const formDataImg = new FormData();
          formDataImg.append("image", biddingData.nidImage);

          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
            {
              method: "POST",
              body: formDataImg,
            }
          );

          const result = await response.json();
          if (result.success) {
            nidUrl = result.data.url;
          }
        }
      }

      // Calculate rental days and total price
      const rentalDays = calculateRentalDays();
      const totalPrice = calculateTotalPrice();

      // Prepare comprehensive booking data
      const bookingData = {
        // Car and Owner Info
        carId: car._id,
        ownerId: owner._id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        ownerPhone: owner.phone || "",

        // Renter Info (from user session)
        renterId: user._id || user.id,
        renterName: biddingData.renterName,
        renterPhone: biddingData.renterPhone,
        renterEmail: user?.email,
        renterAddress: biddingData.renterAddress,
        renterAge: parseInt(biddingData.renterAge),
        renterLicense: biddingData.renterLicense,

        // Document URLs (if uploaded)
        drivingLicenseImage: drivingLicenseUrl,
        nidImage: nidUrl,

        // Car Details for Reference
        

        // Rental Period Details
        startDate: biddingData.startDate,
        endDate: biddingData.endDate,
        pickupTime: biddingData.pickupTime,
        dropoffTime: biddingData.dropoffTime,

        // Location Details
        pickupLocation: biddingData.pickupLocation,
        dropoffLocation: biddingData.dropoffLocation,

        // Rental Requirements
        specialRequests: biddingData.specialRequests,
        estimatedMileage: biddingData.estimatedMileage
          ? parseInt(biddingData.estimatedMileage)
          : 0,
        purposeOfRental: biddingData.purposeOfRental,
        previousRentalExperience: biddingData.previousRentalExperience,

        // Financial Details
        dailyRate: car.rental_details.rental_price_per_day,
        totalDays: rentalDays,
        estimatedTotal: totalPrice,
        advanceAmount: Math.round(totalPrice / 2),
        remainingAmount: Math.round(totalPrice / 2),
        paymentMethod: biddingData.paymentMethod,

        // Verification and Status
        renterVerificationStatus: isVerified ? "Verified" : "Pending",
        status: "pending",
        biddingType: "initial_request",

        // Terms and Agreement
        agreeToTerms: biddingData.agreeToTerms,

      };

      // Log the data being sent for debugging
      console.log("Submitting booking data:", bookingData);

      const response = await axios.post(
        "http://localhost:9000/booking",
        bookingData
      );

      console.log("Booking response:", response.data);

      if (response.data && response.data._id) {
        toast.success(
          "Bidding Request Submitted Successfully! Car owner will review your request."
        );

        // Close modal first
        onClose();

        // Navigate to my bookings page after a short delay
        setTimeout(() => {
          navigate("/dashboard/my-bookings");
        }, 500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Bidding submission error:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to submit request: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error(
          "No response from server. Please check your connection and try again."
        );
      } else {
        console.error("Request setup error:", error.message);
        toast.error(`Failed to submit bidding request: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRentalDays = () => {
    if (!biddingData.startDate || !biddingData.endDate) {
      return 0;
    }
    const start = new Date(biddingData.startDate);
    const end = new Date(biddingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotalPrice = () => {
    const days = calculateRentalDays();
    return days * car.rental_details.rental_price_per_day;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-16 py-10">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Submit Rental Bidding</h2>
              {isCheckingVerification ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-sm">Checking status...</span>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    isVerified
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`}
                >
                  <Shield size={16} />
                  {isVerified ? "Verified Renter" : "Verify To Get Priority"}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Car Information Summary */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">
              {car.car_details.car_make} {car.car_details.car_model} (
              {car.car_details.year})
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <p>Owner: {owner.name}</p>
              <p>Daily Rate: ৳{car.rental_details.rental_price_per_day}</p>
              <p>Fuel Type: {car.car_details.fuel_type}</p>
              <p>Transmission: {car.car_details.transmission_type}</p>
              <p>Seats: {car.car_details.number_of_seats}</p>
              <p>Body Style: {car.car_details.body_style}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Rental Period */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-800">
                Rental Period
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.startDate}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          startDate: e.target.value,
                        })
                      }
                    />
                    <Calendar
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={
                        biddingData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.endDate}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          endDate: e.target.value,
                        })
                      }
                    />
                    <Calendar
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pickup Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.pickupTime}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          pickupTime: e.target.value,
                        })
                      }
                    />
                    <Clock
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dropoff Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.dropoffTime}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          dropoffTime: e.target.value,
                        })
                      }
                    />
                    <Clock
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section - Only for Non-Verified Users */}
            {!isVerified && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">
                  Document Verification
                </h4>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="text-yellow-600" size={20} />
                    <span className="font-medium text-yellow-800">
                      Verification Required
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Since you're not a verified user, please upload the
                    following documents for verification:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Driving License Image{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, JPEG, PNG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          required={!isVerified}
                          onChange={(e) =>
                            handleFileUpload(e, "drivingLicenseImage")
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                    {biddingData.drivingLicenseImage && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {biddingData.drivingLicenseImage.name} selected
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      National ID (NID) Image{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, JPEG, PNG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          required={!isVerified}
                          onChange={(e) => handleFileUpload(e, "nidImage")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {biddingData.nidImage && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {biddingData.nidImage.name} selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  • Accepted formats: JPG, JPEG, PNG • Maximum file size: 5MB
                  per image • Ensure images are clear and readable
                </div>
              </div>
            )}

            {/* Renter Information */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-800">
                Renter Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.renterName}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          renterName: e.target.value,
                        })
                      }
                    />
                    <User
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.renterPhone}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          renterPhone: e.target.value,
                        })
                      }
                    />
                    <Phone
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="80"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={biddingData.renterAge}
                    onChange={(e) =>
                      setBiddingData({
                        ...biddingData,
                        renterAge: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Driving License Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={biddingData.renterLicense}
                    onChange={(e) =>
                      setBiddingData({
                        ...biddingData,
                        renterLicense: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter your complete address"
                    value={biddingData.renterAddress}
                    onChange={(e) =>
                      setBiddingData({
                        ...biddingData,
                        renterAddress: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Pickup/Dropoff Locations */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-800">
                Pickup & Dropoff
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter pickup address"
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.pickupLocation}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          pickupLocation: e.target.value,
                        })
                      }
                    />
                    <MapPin
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dropoff Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter dropoff address"
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                      value={biddingData.dropoffLocation}
                      onChange={(e) =>
                        setBiddingData({
                          ...biddingData,
                          dropoffLocation: e.target.value,
                        })
                      }
                    />
                    <MapPin
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-800">
                Rental Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Mileage (KM)
                  </label>
                  <input
                    type="number"
                    placeholder="Expected kilometers to drive"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={biddingData.estimatedMileage}
                    onChange={(e) =>
                      setBiddingData({
                        ...biddingData,
                        estimatedMileage: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Purpose of Rental
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={biddingData.purposeOfRental}
                    onChange={(e) =>
                      setBiddingData({
                        ...biddingData,
                        purposeOfRental: e.target.value,
                      })
                    }
                  >
                    <option value="">Select purpose</option>
                    <option value="personal">Personal Use</option>
                    <option value="business">Business</option>
                    <option value="tourism">Tourism/Travel</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={biddingData.previousRentalExperience}
                    onChange={(e) =>
                      setBiddingData({
                        ...biddingData,
                        previousRentalExperience: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">
                    I have previous car rental experience
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Special Requests or Notes
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Any special requirements, questions, or notes for the car owner..."
                  value={biddingData.specialRequests}
                  onChange={(e) =>
                    setBiddingData({
                      ...biddingData,
                      specialRequests: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-800">
                Payment Information
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-800">
                    Payment Process
                  </span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • 50% advance payment required through our website after
                    owner accepts your booking
                  </li>
                  <li>
                    • Remaining 50% can be paid in cash directly to the car
                    owner
                  </li>
                  <li>• Advance payment ensures your booking confirmation</li>
                  <li>• Full refund if owner cancels after acceptance</li>
                </ul>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="mb-6">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1"
                  checked={biddingData.agreeToTerms}
                  onChange={(e) =>
                    setBiddingData({
                      ...biddingData,
                      agreeToTerms: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">
                  I agree to the rental terms and conditions, understand that
                  this is a bidding request, and the car owner may accept or
                  reject my request. I also agree to pay 50% advance through the
                  website upon booking acceptance, with the remaining 50%
                  payable in cash to the owner.
                </span>
              </label>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Estimated Cost</h4>
              <div className="flex justify-between mb-2">
                <span>Daily Rate:</span>
                <span>৳{car.rental_details.rental_price_per_day}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Rental Days:</span>
                <span>{calculateRentalDays()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Estimated Total:</span>
                <span>৳{calculateTotalPrice()}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Advance Payment (50%):</span>
                  <span>৳{(calculateTotalPrice() / 2).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash to Owner (50%):</span>
                  <span>৳{(calculateTotalPrice() / 2).toFixed(0)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *Final price may vary based on additional services, mileage, and
                owner's terms
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!biddingData.agreeToTerms || isCheckingVerification}
            >
              {isCheckingVerification
                ? "Checking Verification..."
                : "Submit Bidding Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;