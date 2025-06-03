import { Fa500Px, FaBusinessTime, FaCalendar, FaCamera } from "react-icons/fa";
import { FaMailchimp, FaTimeline, FaLock } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { GrLicense } from "react-icons/gr";
import { TbLicense } from "react-icons/tb";
import axios from "axios";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const imgbbApi = "41a71049f5f8bd040846fcf2d7168ed2";
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Color palette based on #0d786d
  const colors = {
    primary: "#0d786d",
    secondary: "#10a599",
    accent: "#076158",
    light: "#edf7f6",
    dark: "#065048",
    text: "#334155",
    textLight: "#64748b",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserData(user.email);
    }

    // Check for payment verification status in URL params
    const queryParams = new URLSearchParams(window.location.search);
    const verificationStatus = queryParams.get("verification");

    if (verificationStatus === "success") {
      toast.success(
        "Payment successful! Your verification is pending admin approval."
      );
      // Remove the query parameter
      navigate(window.location.pathname, { replace: true });
      fetchUserData(user.email);
    } else if (verificationStatus === "failed") {
      toast.error("Payment failed. Please try again.");
      navigate(window.location.pathname, { replace: true });
    } else if (verificationStatus === "cancelled") {
      toast.error("Payment was cancelled.");
      navigate(window.location.pathname, { replace: true });
    }
  }, [user?.email, navigate]);

  const fetchUserData = async (email) => {
    try {
      const { data } = await axios.get(`http://localhost:9000/users/${email}`);
      console.log(data);

      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast.error("Failed to load profile data");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleProfilePicClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUpdatingPhoto(true);

      const formDataImg = new FormData();
      formDataImg.append("image", file);

      const uploadRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
        formDataImg
      );

      const newPhotoUrl = uploadRes.data.data.url;

      await axios.put(`http://localhost:9000/users/${user.email}`, {
        photo: newPhotoUrl,
      });

      toast.success("Profile picture updated successfully!");
      fetchUserData(user.email);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "verified":
        return colors.success;
      case "pending":
        return colors.warning;
      case "rejected":
        return colors.danger;
      default:
        return colors.textLight;
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: colors.primary }}
        ></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ borderTop: `4px solid ${colors.primary}` }}
      >
        {/* Header Background */}
        <div
          className="h-40 relative"
          style={{
            background: `linear-gradient(120deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{
              background: `linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)`,
            }}
          ></div>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-8">
          {/* Profile Image */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleProfilePicChange}
              />
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {isUpdatingPhoto ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: colors.light }}
                  >
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                      style={{ borderColor: colors.primary }}
                    ></div>
                  </div>
                ) : (
                  <img
                    src={userData.photo}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div
                onClick={handleProfilePicClick}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-110"
                style={{ backgroundColor: colors.primary }}
              >
                <FaCamera className="text-white" />
              </div>
              <div
                className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300 cursor-pointer"
                onClick={handleProfilePicClick}
              ></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold" style={{ color: colors.text }}>
              {userData.name}
            </h2>
            <p
              className="font-medium text-lg capitalize mt-1"
              style={{ color: colors.primary }}
            >
              {userData.userType}
            </p>
            {userData.verificationData?.status && (
              <div
                className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${getStatusColor(
                    userData.verificationData?.status
                  )}20`,
                  color: getStatusColor(userData.verificationData?.status),
                }}
              >
                {userData.verificationData?.status === "approved" || userData.verificationData?.status === "verified"
                  ? "Verified"
                  : userData.verificationData?.status === "pending"
                  ? "Verification Pending"
                  : userData.verificationData?.status === "rejected"
                  ? "Verification Rejected"
                  : "Unverified"}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div
              className="flex items-center p-3 rounded-lg transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: `${colors.light}` }}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <FaMailchimp
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
              </div>
              <div className="ml-4">
                <p
                  className="text-xs font-medium"
                  style={{ color: colors.textLight }}
                >
                  Email
                </p>
                <p className="font-medium" style={{ color: colors.text }}>
                  {userData.email}
                </p>
              </div>
            </div>
            <div
              className="flex items-center p-3 rounded-lg transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: `${colors.light}` }}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <FaPhoneAlt
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
              </div>
              <div className="ml-4">
                <p
                  className="text-xs font-medium"
                  style={{ color: colors.textLight }}
                >
                  Phone
                </p>
                <p className="font-medium" style={{ color: colors.text }}>
                  {userData.phone}
                </p>
              </div>
            </div>
            <div
              className="flex items-center p-3 rounded-lg transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: `${colors.light}` }}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <FaCalendar
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
              </div>
              <div className="ml-4">
                <p
                  className="text-xs font-medium"
                  style={{ color: colors.textLight }}
                >
                  Joined on
                </p>
                <p className="font-medium" style={{ color: colors.text }}>
                  {formatDate(userData.createdAt)}
                </p>
              </div>
            </div>
            <div
              className="flex items-center p-3 rounded-lg transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: `${colors.light}` }}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <FaLock className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <div className="ml-4">
                <p
                  className="text-xs font-medium"
                  style={{ color: colors.textLight }}
                >
                  Subscription
                </p>
                <p className="font-medium" style={{ color: colors.text }}>
                  {userData.verificationStatus
                    ? "Verified Member"
                    : "Not Verified"}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          {userData.verificationData?.status === "verified" && (
            <div
              className="mt-10 border-t pt-6"
              style={{ borderColor: `${colors.light}` }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: colors.primary }}
              >
                Verification Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <GrLicense
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                    />
                    <div className="ml-3">
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        License Number
                      </p>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {userData.verificationData.licenseNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <Fa500Px
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                    />
                    <div className="ml-3">
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        NID Number
                      </p>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {userData.verificationData.nid}
                      </p>
                    </div>
                  </div>

                  {userData.userType === "renter" && (
                    <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                      <TbLicense
                        className="w-5 h-5"
                        style={{ color: colors.primary }}
                      />
                      <div className="ml-3">
                        <p
                          className="text-xs"
                          style={{ color: colors.textLight }}
                        >
                          Vehicle Registration
                        </p>
                        <p
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {userData.verificationData.vehicleReg}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <FaTimeline
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                    />
                    <div className="ml-3">
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        Additional Notes
                      </p>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {userData.verificationData.additionalNotes || "None"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <FaBusinessTime
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                    />
                    <div className="ml-3">
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        Admin Remarks
                      </p>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {userData.adminNotes || "None"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <FaBusinessTime
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                    />
                    <div className="ml-3">
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        Submitted At
                      </p>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {formatDate(userData.verificationData.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <FaBusinessTime
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                    />
                    <div className="ml-3">
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        Verified At
                      </p>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {formatDate(userData.verificationData.verifiedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: colors.primary }}
                  >
                    NID Photo
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={userData.verificationData.nidPhoto}
                      alt="NID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-md">
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: colors.primary }}
                  >
                    License Image
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={userData.verificationData.licenseImage}
                      alt="License"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {userData.userType === "renter" && (
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: colors.primary }}
                    >
                      Vehicle Registration Image
                    </p>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={userData.verificationData.vehicleRegImage}
                        alt="Vehicle Registration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show rejected message */}
          {userData.verificationData?.status === "rejected" && (
            <div
              className="mt-6 p-4 rounded-lg border"
              style={{
                borderColor: colors.danger,
                backgroundColor: `${colors.danger}10`,
              }}
            >
              <h3 className="font-medium mb-2" style={{ color: colors.danger }}>
                Verification Rejected
              </h3>
              <p style={{ color: colors.text }}>
                {userData.verificationData.rejectionReason ||
                  "Your verification request was rejected. Please check your documents and try again."}
              </p>
              <Link
                to="/dashboard/verification"
                className="inline-block mt-3 px-4 py-2 rounded-md font-medium text-white transition-colors duration-300"
                style={{ backgroundColor: colors.primary }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = colors.secondary)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = colors.primary)
                }
              >
                Resubmit Verification
              </Link>
            </div>
          )}

          {/* Show verification prompt for unverified users */}
          {(!userData.verificationData ||
            userData.verificationData?.status === "pending") && (
            <div
              className="mt-8 p-6 rounded-lg"
              style={{ backgroundColor: colors.light }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: colors.primary }}
                  >
                    Get Verified
                  </h3>
                  <p className="mt-1" style={{ color: colors.text }}>
                    {userData.verificationData?.status === "pending"
                      ? "Your verification is under review. This usually takes 1-2 business days."
                      : "Complete your verification to access all features and increase trust."}
                  </p>
                </div>
                {!userData.verificationData && (
                  <Link
                    to="/dashboard/verification"
                    className="px-6 py-2 rounded-md font-medium text-white transition-colors duration-300"
                    style={{ backgroundColor: colors.primary }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = colors.secondary)
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = colors.primary)
                    }
                  >
                    Start Verification
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Subscription Section */}
          {/* {!userData.isSubscribed && (
            <div
              className="mt-8 p-6 rounded-lg border"
              style={{
                borderColor: colors.warning,
                backgroundColor: `${colors.warning}10`,
              }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: colors.warning }}
                  >
                    Upgrade to Verified Member
                  </h3>
                  <p className="mt-1" style={{ color: colors.text }}>
                    Subscribe to unlock premium features and get verified
                    status.
                  </p>
                </div>
                <button
                  onClick={() => {
                    // This would typically redirect to a payment gateway
                    // For demo, we'll simulate it
                    setPaymentUrl("https://payment-gateway.example.com");
                    toast.success("Redirecting to payment gateway...");
                  }}
                  className="px-6 py-2 rounded-md font-medium text-white transition-colors duration-300"
                  style={{ backgroundColor: colors.primary }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = colors.secondary)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = colors.primary)
                  }
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          )} */}

          {/* Edit Profile Button */}
          <div className="mt-8 text-center">
            <Link
              to="/profile/edit"
              className="inline-flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-300 border"
              style={{
                color: colors.primary,
                borderColor: colors.primary,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = colors.primary;
              }}
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;