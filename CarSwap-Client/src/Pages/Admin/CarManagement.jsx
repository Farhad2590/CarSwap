import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  FaCheck, 
  FaTimes, 
  FaCar, 
  FaUser,
  FaTrash,
  FaEye,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { MdWarning, MdPendingActions } from "react-icons/md";
import UserDetailsModal from "./components/UserDetailsModal";
// import UserDetailsModal from "./CarManagement/components/UserDetailsModal";

const CarManagement = () => {
  const [carPosts, setCarPosts] = useState([]);
  const [singleUser, setSingleUser] = useState({});
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const api = "http://localhost:9000";

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
    fetchAllCarPosts();
  }, [activeTab]);

  const fetchAllCarPosts = async () => {
    try {
      setLoading(true);
      let endpoint = `${api}/cars/`;
      if (activeTab !== "all") {
        endpoint += `?status=${activeTab}`;
      }
      const response = await axios.get(endpoint);
      setCarPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
      toast.error("Failed to load car posts");
    }
  };

  const handleUser = async (userEmail) => {
    try {
      const response = await axios.get(`${api}/users/${userEmail}`);
      setSingleUser(response.data);
      setShowUserModal(true);
    } catch (err) {
      toast.error("Failed to load user details");
    }
  };

  const handleCarDetails = (car) => {
    setSelectedCar(car);
    setShowCarModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car post?"))
      return;

    try {
      await axios.delete(`${api}/cars/${id}`);
      fetchAllCarPosts();
      toast.success("Car post deleted successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      toast.error("Failed to delete car post");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this car post?"))
      return;

    try {
      await axios.put(`${api}/cars/approve/${id}`);
      fetchAllCarPosts();
      toast.success("Car post approved successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      toast.error("Failed to approve car post");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;

    try {
      await axios.put(`${api}/cars/reject/${id}`, { rejectionReason: reason });
      fetchAllCarPosts();
      toast.success("Car post rejected successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      toast.error("Failed to reject car post");
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSingleUser({});
  };

  const closeCarModal = () => {
    setShowCarModal(false);
    setSelectedCar(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <div className="flex items-center">
            <FaCheck className="mr-1" style={{ color: colors.success }} />
            <span>Approved</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center">
            <MdPendingActions className="mr-1" style={{ color: colors.warning }} />
            <span>Pending</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center">
            <FaTimes className="mr-1" style={{ color: colors.danger }} />
            <span>Rejected</span>
          </div>
        );
      default:
        return <span>Unknown</span>;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: `${colors.success}30`,
          text: colors.success,
        };
      case "pending":
        return {
          bg: `${colors.warning}30`,
          text: colors.warning,
        };
      case "rejected":
        return {
          bg: `${colors.danger}30`,
          text: colors.danger,
        };
      default:
        return {
          bg: "#a0aec030",
          text: "#a0aec0",
        };
    }
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <BiLoaderAlt
            className="animate-spin text-4xl mb-2"
            style={{ color: colors.primary }}
          />
          <p style={{ color: colors.textLight }}>Loading car posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <MdWarning
            className="text-4xl mb-2"
            style={{ color: colors.danger }}
          />
          <p style={{ color: colors.danger }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <FaCar className="text-3xl mr-3" style={{ color: colors.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Car Management
          </h1>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex mb-6 border-b" style={{ borderColor: colors.light }}>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "all" ? "border-b-2" : ""}`}
          style={{
            color: activeTab === "all" ? colors.primary : colors.textLight,
            borderColor: activeTab === "all" ? colors.primary : "transparent"
          }}
          onClick={() => setActiveTab("all")}
        >
          All Cars
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "pending" ? "border-b-2" : ""}`}
          style={{
            color: activeTab === "pending" ? colors.warning : colors.textLight,
            borderColor: activeTab === "pending" ? colors.warning : "transparent"
          }}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "approved" ? "border-b-2" : ""}`}
          style={{
            color: activeTab === "approved" ? colors.success : colors.textLight,
            borderColor: activeTab === "approved" ? colors.success : "transparent"
          }}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "rejected" ? "border-b-2" : ""}`}
          style={{
            color: activeTab === "rejected" ? colors.danger : colors.textLight,
            borderColor: activeTab === "rejected" ? colors.danger : "transparent"
          }}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
      </div>

      <div
        className="bg-white shadow-lg rounded-xl overflow-hidden border"
        style={{ borderColor: `${colors.light}` }}
      >
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y"
            style={{ borderColor: colors.light }}
          >
            <thead>
              <tr style={{ backgroundColor: colors.light }}>
                <th
                  className="py-4 px-6 text-left text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  Model
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  Price
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  Location
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  Status
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.light }}>
              {carPosts.map((carPost) => {
                const statusBadgeStyle = getStatusBadgeStyle(carPost.status);

                return (
                  <tr
                    key={carPost._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {carPost.car_details?.car_photos?.[0] ? (
                          <img
                            src={carPost.car_details.car_photos[0]}
                            alt={`${carPost.car_details.car_make} ${carPost.car_details.car_model}`}
                            className="w-12 h-12 object-cover rounded-md mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md mr-3 flex items-center justify-center" style={{ backgroundColor: colors.light }}>
                            <FaCar style={{ color: colors.primary }} />
                          </div>
                        )}
                        <div>
                          <span
                            className="font-medium block"
                            style={{ color: colors.text }}
                          >
                            {carPost.car_details?.car_make || "N/A"} {carPost.car_details?.car_model || "N/A"}
                          </span>
                          <span className="text-xs" style={{ color: colors.textLight }}>
                            {carPost.car_details?.year || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6" style={{ color: colors.text }}>
                      ${carPost.rental_details?.rental_price_per_day || "N/A"}
                      <span className="text-xs block" style={{ color: colors.textLight }}>per day</span>
                    </td>
                    <td className="py-4 px-6" style={{ color: colors.text }}>
                      {carPost.posting_location || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center capitalize"
                        style={{
                          backgroundColor: statusBadgeStyle.bg,
                          color: statusBadgeStyle.text,
                        }}
                      >
                        {getStatusBadge(carPost.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCarDetails(carPost)}
                          className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: `${colors.primary}20` }}
                          title="View Details"
                        >
                          <FaEye size={16} style={{ color: colors.primary }} />
                        </button>
                        
                        <button
                          onClick={() => handleUser(carPost.userEmail)}
                          className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: `${colors.secondary}20` }}
                          title="View Owner"
                        >
                          <FaUser size={16} style={{ color: colors.secondary }} />
                        </button>

                        {carPost.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(carPost._id)}
                              className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: `${colors.success}20` }}
                              title="Approve"
                            >
                              <FaThumbsUp size={16} style={{ color: colors.success }} />
                            </button>
                            <button
                              onClick={() => handleReject(carPost._id)}
                              className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: `${colors.danger}20` }}
                              title="Reject"
                            >
                              <FaThumbsDown size={16} style={{ color: colors.danger }} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(carPost._id)}
                          className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: `${colors.danger}20` }}
                          title="Delete"
                        >
                          <FaTrash size={16} style={{ color: colors.danger }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {carPosts.length === 0 && (
          <div className="py-8 text-center" style={{ color: colors.textLight }}>
            No car posts found
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && (
        <UserDetailsModal
          user={singleUser}
          onClose={closeUserModal}
          colors={colors}
        />
      )}

      {/* Car Details Modal */}
      {showCarModal && selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div 
            className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex"
          >
            {/* Close Button */}
            <button
              onClick={closeCarModal}
              className="absolute top-4 right-4 p-2 rounded-full z-10 transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: `${colors.danger}20` }}
              title="Close"
              aria-label="Close modal"
            >
              <FaTimes size={16} style={{ color: colors.danger }} />
            </button>

            {/* Vertical Image Slider */}
            <div className="w-1/2 h-[90vh] overflow-y-auto">
              {selectedCar.car_details?.car_photos?.length > 0 ? (
                <div className="space-y-4 p-4">
                  {selectedCar.car_details.car_photos.map((photo, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md">
                      <img
                        src={photo}
                        alt={`${selectedCar.car_details.car_make} ${selectedCar.car_details.car_model} - ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center" style={{ backgroundColor: colors.light }}>
                  <div className="text-center">
                    <FaCar size={48} style={{ color: colors.primary }} className="mx-auto mb-4" />
                    <p style={{ color: colors.primary }}>No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="w-1/2 h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                {selectedCar.car_details?.car_make} {selectedCar.car_details?.car_model}
              </h2>
              
              <div className="flex items-center mb-6">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium capitalize mr-4"
                  style={{ 
                    backgroundColor: selectedCar.status === "approved" 
                      ? `${colors.success}30` 
                      : selectedCar.status === "pending" 
                        ? `${colors.warning}30` 
                        : `${colors.danger}30`,
                    color: selectedCar.status === "approved" 
                      ? colors.success 
                      : selectedCar.status === "pending" 
                        ? colors.warning 
                        : colors.danger
                  }}
                >
                  {selectedCar.status}
                </span>
                <span className="text-sm" style={{ color: colors.textLight }}>
                  Posted: {new Date(selectedCar.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Year</p>
                  <p style={{ color: colors.text }}>{selectedCar.car_details?.year || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Color</p>
                  <p style={{ color: colors.text }}>{selectedCar.car_details?.car_color || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Body Style</p>
                  <p style={{ color: colors.text }}>{selectedCar.car_details?.body_style || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Seats</p>
                  <p style={{ color: colors.text }}>{selectedCar.car_details?.number_of_seats || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Fuel Type</p>
                  <p style={{ color: colors.text }}>{selectedCar.car_details?.fuel_type || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Transmission</p>
                  <p style={{ color: colors.text }}>{selectedCar.car_details?.transmission_type || "N/A"}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Rental Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Price Per Day</p>
                    <p style={{ color: colors.text }}>${selectedCar.rental_details?.rental_price_per_day || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Min Rental Period</p>
                    <p style={{ color: colors.text }}>{selectedCar.rental_details?.minimum_rental_period || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Max Rental Period</p>
                    <p style={{ color: colors.text }}>{selectedCar.rental_details?.maximum_rental_period || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Security Deposit</p>
                    <p style={{ color: colors.text }}>${selectedCar.rental_details?.security_deposit_amount || "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedCar.termsandcondition && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Features & Terms</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {selectedCar.termsandcondition.air_conditioning && <span style={{ color: colors.text }}>✓ Air Conditioning</span>}
                      {selectedCar.termsandcondition.gps_navigation && <span style={{ color: colors.text }}>✓ GPS Navigation</span>}
                      {selectedCar.termsandcondition.bluetooth_audio && <span style={{ color: colors.text }}>✓ Bluetooth Audio</span>}
                      {selectedCar.termsandcondition.child_seat && <span style={{ color: colors.text }}>✓ Child Seat</span>}
                      {selectedCar.termsandcondition.sunroof && <span style={{ color: colors.text }}>✓ Sunroof</span>}
                      {selectedCar.termsandcondition.smoking_allowed && <span style={{ color: colors.text }}>✓ Smoking Allowed</span>}
                      {selectedCar.termsandcondition.pets_allowed && <span style={{ color: colors.text }}>✓ Pets Allowed</span>}
                      {selectedCar.termsandcondition.drivers_license_required && <span style={{ color: colors.text }}>✓ License Required</span>}
                    </div>
                    
                    {selectedCar.termsandcondition.other_features?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Other Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCar.termsandcondition.other_features.map((feature, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium" style={{ color: colors.textLight }}>Fuel Policy:</p>
                      <p style={{ color: colors.text }}>{selectedCar.termsandcondition.fuel_policy || "N/A"}</p>
                      
                      {selectedCar.termsandcondition.additional_terms && (
                        <>
                          <p className="text-sm font-medium mt-2" style={{ color: colors.textLight }}>Additional Terms:</p>
                          <p style={{ color: colors.text }}>{selectedCar.termsandcondition.additional_terms}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedCar.registration_document && (
                    <a 
                      href={selectedCar.registration_document} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all"
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Registration</p>
                      <p style={{ color: colors.primary }} className="truncate">View Document</p>
                    </a>
                  )}
                  {selectedCar.insurance_document && (
                    <a 
                      href={selectedCar.insurance_document} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all"
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>Insurance</p>
                      <p style={{ color: colors.primary }} className="truncate">View Document</p>
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Owner Information</h3>
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => handleUser(selectedCar.userEmail)}
                    className="flex items-center text-sm"
                    style={{ color: colors.primary }}
                  >
                    <FaUser className="mr-2" />
                    {selectedCar.userEmail}
                  </button>
                </div>
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Location: {selectedCar.posting_location || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarManagement;