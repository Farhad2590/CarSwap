import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import {
  FaIdCard,
  FaCar,
  FaCheckCircle,
} from "react-icons/fa";

const ProfileVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const [formData, setFormData] = useState({
    licenseNumber: "",
    nid: "",
    vehicleReg: "",
    additionalNotes: "",
    licenseImage: null,
    nidPhoto: null,
    vehicleRegImage: null,
  });


  const licenseImageRef = useRef(null);
  const nidPhotoRef = useRef(null);
  const vehicleRegImageRef = useRef(null);


  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get("verification");

    if (status) {
      setVerificationStatus(status);

      navigate(window.location.pathname, { replace: true });

      if (status === "success") {
        toast.success(
          "Payment successful! Your verification is pending admin approval."
        );
      } else if (status === "failed") {
        toast.error("Payment failed. Please try again.");
      } else if (status === "cancelled") {
        toast.error("Payment was cancelled.");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (
        !formData.licenseNumber ||
        !formData.nid ||
        !formData.licenseImage ||
        !formData.nidPhoto
      ) {
        toast.error(
          "Please fill in all required fields and upload required documents."
        );
        return;
      }

      if (
        user.userType === "renter" &&
        (!formData.vehicleReg || !formData.vehicleRegImage)
      ) {
        toast.error(
          "Vehicle registration number and image are required for renters."
        );
        return;
      }

      const uploadPromises = [
        uploadImage(formData.licenseImage),
        uploadImage(formData.nidPhoto),
      ];

      if (user.userType === "renter" && formData.vehicleRegImage) {
        uploadPromises.push(uploadImage(formData.vehicleRegImage));
      }

      const uploadResults = await Promise.all(uploadPromises);
      const [licenseImageUrl, nidPhotoUrl, vehicleRegImageUrl] = uploadResults;

      const verificationData = {
        licenseNumber: formData.licenseNumber,
        nid: formData.nid,
        additionalNotes: formData.additionalNotes,
        licenseImage: licenseImageUrl,
        nidPhoto: nidPhotoUrl,
        ...(user.userType === "renter" && {
          vehicleReg: formData.vehicleReg,
          vehicleRegImage: vehicleRegImageUrl,
        }),
      };

      const response = await axios.post(
        "http://localhost:9000/users/initiate-verification",
        {
          email: user.email,
          verificationData,
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Verification submission error:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to submit verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      "https://api.imgbb.com/1/upload?key=41a71049f5f8bd040846fcf2d7168ed2",
      formData
    );

    return response.data.data.url;
  };

  if (paymentUrl) {
    window.location.href = paymentUrl;
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Redirecting to payment gateway...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
        <div className="text-green-500 mb-4">
          <FaCheckCircle className="text-5xl mx-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your verification request has been submitted and is pending admin
          approval. You will be notified once your account is verified.
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Account Verification
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Complete your account verification to access all features. A one-time
        verification fee of ৳100 is required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driving License Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            National ID (NID) Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nid"
            value={formData.nid}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {user.userType === "renter" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Registration Number{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vehicleReg"
              value={formData.vehicleReg}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driving License Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="licenseImage"
              ref={licenseImageRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              required
            />
            <div
              onClick={() => triggerFileInput(licenseImageRef)}
              className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition"
            >
              {formData.licenseImage ? (
                <div className="space-y-2">
                  <FaIdCard className="mx-auto text-3xl text-blue-500" />
                  <p className="text-sm text-gray-600 truncate">
                    {formData.licenseImage.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FaIdCard className="mx-auto text-3xl text-gray-400" />
                  <p className="text-sm text-gray-600">Upload License Image</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NID Photo <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="nidPhoto"
              ref={nidPhotoRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              required
            />
            <div
              onClick={() => triggerFileInput(nidPhotoRef)}
              className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition"
            >
              {formData.nidPhoto ? (
                <div className="space-y-2">
                  <FaIdCard className="mx-auto text-3xl text-blue-500" />
                  <p className="text-sm text-gray-600 truncate">
                    {formData.nidPhoto.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FaIdCard className="mx-auto text-3xl text-gray-400" />
                  <p className="text-sm text-gray-600">Upload NID Photo</p>
                </div>
              )}
            </div>
          </div>

          {user.userType === "renter" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Registration Image{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="vehicleRegImage"
                ref={vehicleRegImageRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                required
              />
              <div
                onClick={() => triggerFileInput(vehicleRegImageRef)}
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition"
              >
                {formData.vehicleRegImage ? (
                  <div className="space-y-2">
                    <FaCar className="mx-auto text-3xl text-blue-500" />
                    <p className="text-sm text-gray-600 truncate">
                      {formData.vehicleRegImage.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FaCar className="mx-auto text-3xl text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Upload Vehicle Registration Image
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-lg mb-2">Payment Summary</h3>
          <div className="flex justify-between items-center">
            <span>Verification Fee:</span>
            <span className="font-bold">৳100.00</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            "Proceed to Payment"
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileVerification;
