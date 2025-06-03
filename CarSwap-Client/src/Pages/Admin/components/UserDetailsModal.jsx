import { useState, useEffect } from "react";
import { FaTimes, FaPhoneAlt, FaCalendar, FaIdCard, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlinePending, MdWarning } from "react-icons/md";
import { GrLicense } from "react-icons/gr";
import { TbLicense } from "react-icons/tb";

const UserDetailsModal = ({ user, onClose, colors }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (user?.verificationData?.status === "verified") {
      // Collect all available verification images
      const verificationImages = [
        { src: user.verificationData.nidPhoto, label: "NID Photo" },
        { src: user.verificationData.licenseImage, label: "License" },
        { src: user.verificationData.vehicleRegImage, label: "Vehicle Reg" }
      ].filter(img => img.src); // Filter out any undefined images
      
      setImages(verificationImages);
    }
  }, [user]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (!user || !user.email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 overflow-y-auto">
      <div 
        className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 md:p-8"
        style={{ borderColor: colors.light }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: `${colors.danger}20` }}
          title="Close"
          aria-label="Close modal"
        >
          <FaTimes size={16} style={{ color: colors.danger }} />
        </button>

        {/* Profile Image */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.light }}>
                <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            {user.name}
          </h2>
          <p 
            className="font-medium capitalize mt-1" 
            style={{ color: colors.primary }}
          >
            {user.userType || "user"}
          </p>
          {user.verificationData?.status && (
            <div className="flex items-center justify-center mt-2">
              {user.verificationData?.status === "verified" ? (
                <IoMdCheckmarkCircleOutline size={20} style={{ color: colors.success }} />
              ) : user.verificationData?.status === "pending" ? (
                <MdOutlinePending size={20} style={{ color: colors.warning }} />
              ) : (
                <MdWarning size={20} style={{ color: colors.danger }} />
              )}
              <span 
                className="ml-2 text-sm capitalize"
                style={{ 
                  color: user.verificationData?.status === "verified" 
                    ? colors.success 
                    : user.verificationData?.status === "pending" 
                      ? colors.warning 
                      : colors.danger 
                }}
              >
                {user.verificationData?.status}
              </span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
            <FaIdCard className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
            <FaPhoneAlt className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
            <span>{user.phone || "N/A"}</span>
          </div>
          <div className="flex items-center p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
            <FaCalendar className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
            <span>Joined on {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Verification Info */}
        {user.verificationData?.status && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.light }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
              Verification Information
            </h3>
            
            {/* Verified User Info */}
            {user.verificationData?.status === "verified" && (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
                    <GrLicense className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
                    <span>License: {user.verificationData.licenseNumber}</span>
                  </div>
                  <div className="flex items-center p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
                    <TbLicense className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
                    <span>NID: {user.verificationData.nid}</span>
                  </div>
                  <div className="flex items-center p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
                    <TbLicense className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
                    <span>Vehicle Reg: {user.verificationData.vehicleReg}</span>
                  </div>
                  {user.verificationData.additionalNotes && (
                    <div className="p-2 rounded-lg hover:bg-gray-50" style={{ color: colors.text }}>
                      <div className="flex items-center mb-1">
                        <TbLicense className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
                        <span className="font-medium">Notes:</span>
                      </div>
                      <p className="ml-8" style={{ color: colors.textLight }}>
                        {user.verificationData.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Image Slider */}
                {images.length > 0 && (
                  <div className="mt-4 pb-4">
                    <div 
                      className="relative overflow-hidden rounded-lg shadow-md"
                      style={{ height: "280px" }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={images[currentImageIndex].src}
                          alt={images[currentImageIndex].label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Caption */}
                      <div 
                        className="absolute bottom-0 w-full py-2 px-4 text-center"
                        style={{ backgroundColor: `${colors.primary}90` }}
                      >
                        <p className="text-white text-sm font-medium">
                          {images[currentImageIndex].label} ({currentImageIndex + 1}/{images.length})
                        </p>
                      </div>
                      
                      {/* Navigation Buttons */}
                      {images.length > 1 && (
                        <>
                          <button 
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-70 shadow-md hover:bg-opacity-100 transition-all"
                            aria-label="Previous image"
                          >
                            <FaChevronLeft size={14} style={{ color: colors.primary }} />
                          </button>
                          <button 
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-70 shadow-md hover:bg-opacity-100 transition-all"
                            aria-label="Next image"
                          >
                            <FaChevronRight size={14} style={{ color: colors.primary }} />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {images.length > 1 && (
                      <div className="flex justify-center mt-4 space-x-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              currentImageIndex === index ? "scale-125" : "opacity-50"
                            }`}
                            style={{ 
                              backgroundColor: currentImageIndex === index 
                                ? colors.primary 
                                : colors.textLight
                            }}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Rejected Info */}
            {user.verificationData?.status === "rejected" && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.danger}10` }}>
                <p className="font-medium mb-2" style={{ color: colors.text }}>Admin Remarks:</p>
                <p style={{ color: colors.textLight }}>{user.adminNotes || "No remarks provided"}</p>
              </div>
            )}
            
            {/* Pending Info */}
            {user.verificationData?.status === "pending" && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.warning}10` }}>
                <p className="text-center" style={{ color: colors.textLight }}>
                  Verification is pending review by an administrator.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;