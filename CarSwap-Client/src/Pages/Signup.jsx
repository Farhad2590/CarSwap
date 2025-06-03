import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Image, Car, Repeat, Upload } from "lucide-react";
import Lottie from "lottie-react";
import animationData from "../assets/annimation/login.json";
import UseAuth from "../hooks/useAuth";
import axios from "axios";

const Signup = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state || "/";
  const { createUser, updateUserProfile } = UseAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const imgbbApi = "41a71049f5f8bd040846fcf2d7168ed2";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const lowerCaseEmail = data.email.toLowerCase();
      
      // Upload photo if file was selected
      let photoUrl = "https://i.ibb.co/ScLz5b5/pic1.jpg"; // Default image
      
      if (photoFile) {
        const formDataImg = new FormData();
        formDataImg.append("image", photoFile);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
          { method: "POST", body: formDataImg }
        );
        
        const result = await response.json();
        if (result.success) {
          photoUrl = result.data.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // Create user in Firebase
      const result = await createUser(lowerCaseEmail, data.password);
      await updateUserProfile(data.name, photoUrl);
      
      // Prepare user data for backend
      const userData = {
        email: lowerCaseEmail,
        name: data.name,
        phone: data.phone,
        photo: photoUrl,
        userType: userType,
        verificationStatus: "unverified",
        createdAt: new Date().toISOString(),
      };

      // Save user to database
      await axios.post("http://localhost:9000/users", userData);
      
      reset();
      toast.success(`Account created successfully!`);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    return userType === "owner" ? "Car Owner" : "Car Renter";
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      {/* Left Side - Animation */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="text-center w-full max-w-lg">
          <div className="mb-8">
            <Lottie 
              animationData={animationData} 
              loop={true} 
              className="w-full"
            />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md inline-flex items-center space-x-3">
            {userType === "owner" ? (
              <Car className="text-teal-500 w-6 h-6" />
            ) : (
              <Repeat className="text-teal-500 w-6 h-6" />
            )}
            <span className="font-medium text-gray-800">
              Signing up as a{" "}
              <span className="text-teal-500 font-bold">{getRoleTitle()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-teal-600 mb-2">
              Create Your {getRoleTitle()} Account
            </h2>
            <p className="text-gray-500">
              {userType === "owner"
                ? "List your car and start earning today"
                : "Find the perfect car for your needs"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-teal-500" />
                </div>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
                  placeholder="Full Name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-teal-500" />
                </div>
                <input
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  {...register("phone", { required: "Phone number is required" })}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
                  placeholder="Phone Number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Profile Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="profile-photo"
                  />
                  <label
                    htmlFor="profile-photo"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-teal-500 mb-2" />
                    <span className="text-sm font-medium text-teal-600">
                      {photoFile ? "Photo selected" : "Click to upload photo"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {photoFile ? photoFile.name : "JPG, PNG up to 5MB"}
                    </span>
                  </label>
                </div>
                {photoFile && (
                  <div className="flex justify-center mt-2">
                    <div className="w-16 h-16 relative overflow-hidden rounded-full border border-teal-200">
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-500" />
              </div>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
                placeholder="Password"
              />
            </div>
            {errors.password && (
              <div className="flex items-center text-red-500 text-sm">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.password.message}
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-teal-600 hover:text-teal-800">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-teal-600 hover:text-teal-800">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl hover:from-teal-600 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                `Create ${getRoleTitle()} Account`
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;