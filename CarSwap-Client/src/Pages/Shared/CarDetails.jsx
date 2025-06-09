import {
  AlertCircle,
  Baby,
  Calendar,
  Car,
  CheckCircle,
  ChevronLeft,
  Cigarette,
  Clock,
  CreditCard,
  Dog,
  FileText,
  Fuel,
  Mail,
  MapPin,
  Music,
  Phone,
  Shield,
  Star,
  Sun,
  User,
  Users,
  Wifi,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import BookingModal from "../CarRenter/BookingModal";
import useAuth from "../../hooks/useAuth";
import useUserData from "../../hooks/useUserData";

const CarDetails = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const { userData } = useUserData();

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
    const fetchCarDetails = async () => {
      try {
        setLoading(true);

        const carResponse = await fetch(`http://localhost:9000/cars/${carId}`);
        if (!carResponse.ok) {
          throw new Error("Failed to fetch car details");
        }
        const carData = await carResponse.json();

        setCar(carData);

        if (carData.userEmail) {
          const ownerResponse = await fetch(
            `http://localhost:9000/users/${carData.userEmail}`
          );
          if (!ownerResponse.ok) {
            throw new Error("Failed to fetch owner details");
          }
          const ownerData = await ownerResponse.json();
          setOwner(ownerData);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderFeatureIcon = (feature) => {
    switch (feature) {
      case "GPS":
        return <Wifi size={16} className="text-blue-500" />;
      case "Bluetooth":
        return <Music size={16} className="text-purple-500" />;
      case "Sunroof":
        return <Sun size={16} className="text-yellow-500" />;
      case "Child Seat":
        return <Baby size={16} className="text-pink-500" />;
      default:
        return <Star size={16} className="text-green-500" />;
    }
  };

  const nextReview = () => {
    setCurrentReviewIndex((prevIndex) =>
      prevIndex === car.reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prevIndex) =>
      prevIndex === 0 ? car.reviews.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: colors.primary }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Car Details
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/browse-cars"
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Back to Browse Cars
          </Link>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Car Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The car you are looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/browse-cars"
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Browse Available Cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/browse-cars"
          className="flex items-center mb-6"
          style={{ color: colors.primary }}
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Back to all cars</span>
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Car Images Gallery */}
          <div className="relative">
            <div className="h-96 w-full bg-gray-200 flex items-center justify-center">
              {car.car_details?.car_photos?.length > 0 ? (
                <img
                  src={car.car_details.car_photos[activeImageIndex]}
                  alt={`${car.car_details.car_make} ${car.car_details.car_model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car size={48} className="text-gray-400" />
              )}
            </div>

            {car.car_details?.car_photos?.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {car.car_details.car_photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      activeImageIndex === index
                        ? "bg-blue-600"
                        : "bg-white bg-opacity-60"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* Car Title and Basic Info */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {car.car_details.car_make} {car.car_details.car_model}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {car.car_details.year} • {car.car_details.body_style} •{" "}
                    {car.car_details.fuel_type}
                  </p>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                  ৳{car.rental_details.rental_price_per_day}
                  <span className="text-lg font-normal text-gray-500">
                    /day
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {owner?.verificationStatus === "Verified" && (
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                    style={{ backgroundColor: colors.light, color: colors.dark }}
                  >
                    <CheckCircle size={14} />
                    Verified Owner
                  </div>
                )}
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                  style={{ backgroundColor: colors.light, color: colors.dark }}
                >
                  <Shield size={14} />
                  Approved Listing
                </div>
              </div>
            </div>

            {/* Grid Layout for Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Car Details */}
              <div className="md:col-span-2">
                {/* Location and Availability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-1">
                      <MapPin size={18} />
                      <span className="font-medium">Location</span>
                    </div>
                    <p>{car.posting_location}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-1">
                      <Calendar size={18} />
                      <span className="font-medium">Availability</span>
                    </div>
                    <p>
                      {formatDate(car.rental_details.availability_start_date)}{" "}
                      to {formatDate(car.rental_details.availability_end_date)}
                    </p>
                  </div>
                </div>

                {/* Car Specifications */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Car Specifications
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Seats</div>
                      <div className="flex items-center gap-1 font-medium">
                        <Users size={16} />
                        {car.car_details.number_of_seats}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Transmission</div>
                      <div className="font-medium">
                        {car.car_details.transmission_type}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Mileage</div>
                      <div className="font-medium">
                        {car.car_details.mileage} km
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Color</div>
                      <div className="font-medium">
                        {car.car_details.car_color}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Plate Number</div>
                      <div className="font-medium">
                        {car.car_details.vehicle_number_plate}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Engine No.</div>
                      <div className="font-medium">
                        {car.car_details.vehicle_engine_number}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features and Amenities */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Features & Amenities
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {car.termsandcondition.air_conditioning && (
                      <div className="flex items-center gap-2">
                        <div className="text-blue-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 12h12M6 8h12M6 16h12" />
                          </svg>
                        </div>
                        <span>Air Conditioning</span>
                      </div>
                    )}
                    {car.termsandcondition.gps_navigation && (
                      <div className="flex items-center gap-2">
                        <Wifi size={16} className="text-blue-500" />
                        <span>GPS Navigation</span>
                      </div>
                    )}
                    {car.termsandcondition.bluetooth_audio && (
                      <div className="flex items-center gap-2">
                        <Music size={16} className="text-purple-500" />
                        <span>Bluetooth Audio</span>
                      </div>
                    )}
                    {car.termsandcondition.child_seat && (
                      <div className="flex items-center gap-2">
                        <Baby size={16} className="text-pink-500" />
                        <span>Child Seat</span>
                      </div>
                    )}
                    {car.termsandcondition.sunroof && (
                      <div className="flex items-center gap-2">
                        <Sun size={16} className="text-yellow-500" />
                        <span>Sunroof</span>
                      </div>
                    )}
                    {car.termsandcondition.other_features
                      ?.slice(0, showAllFeatures ? undefined : 3)
                      .map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {renderFeatureIcon(feature)}
                          <span>{feature}</span>
                        </div>
                      ))}
                  </div>
                  {car.termsandcondition.other_features?.length > 3 &&
                    !showAllFeatures && (
                      <button
                        onClick={() => setShowAllFeatures(true)}
                        className="mt-3 text-sm"
                        style={{ color: colors.primary }}
                      >
                        + {car.termsandcondition.other_features.length - 3} more
                        features
                      </button>
                    )}
                </div>

                {/* Rental Terms */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Rental Terms
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Rental Period
                        </h3>
                        <p className="text-gray-600">
                          Min: {car.rental_details.minimum_rental_period}
                          <br />
                          Max: {car.rental_details.maximum_rental_period}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Security Deposit
                        </h3>
                        <p className="text-gray-600">
                          ৳{car.rental_details.security_deposit_amount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Fuel size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Fuel Policy
                        </h3>
                        <p className="text-gray-600">
                          {car.termsandcondition.fuel_policy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          License Required
                        </h3>
                        <p className="text-gray-600">
                          {car.termsandcondition.drivers_license_required
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Rules
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        car.termsandcondition.smoking_allowed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {car.termsandcondition.smoking_allowed ? (
                        <>
                          <Cigarette size={14} />
                          Smoking Allowed
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          No Smoking
                        </>
                      )}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        car.termsandcondition.pets_allowed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {car.termsandcondition.pets_allowed ? (
                        <>
                          <Dog size={14} />
                          Pets Allowed
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          No Pets
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Terms */}
                {car.termsandcondition.additional_terms && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Additional Terms
                    </h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {car.termsandcondition.additional_terms}
                    </p>
                  </div>
                )}

                {/* Reviews Section */}
                {car.reviews && car.reviews.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Customer Reviews
                    </h2>
                    <div className="relative bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">
                          {car.reviews.length} Reviews
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={prevReview}
                            className="p-1 rounded-full hover:bg-gray-200"
                            disabled={car.reviews.length <= 1}
                          >
                            <ChevronLeftIcon
                              size={20}
                              className={
                                car.reviews.length <= 1
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }
                            />
                          </button>
                          <button
                            onClick={nextReview}
                            className="p-1 rounded-full hover:bg-gray-200"
                            disabled={car.reviews.length <= 1}
                          >
                            <ChevronRight
                              size={20}
                              className={
                                car.reviews.length <= 1
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }
                            />
                          </button>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={
                                i < car.reviews[currentReviewIndex].rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 italic mb-4">
                          "{car.reviews[currentReviewIndex].comment}"
                        </p>
                        <p className="text-sm text-gray-500">
                          - {car.reviews[currentReviewIndex].reviewerEmail} •{" "}
                          {formatDate(car.reviews[currentReviewIndex].createdAt)}
                        </p>
                      </div>
                      {car.reviews.length > 1 && (
                        <div className="flex justify-center mt-4 space-x-1">
                          {car.reviews.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentReviewIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                currentReviewIndex === index
                                  ? "bg-gray-700"
                                  : "bg-gray-300"
                              }`}
                              aria-label={`Go to review ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Documents
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {car.registration_document && (
                      <a
                        href={car.registration_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <FileText size={20} style={{ color: colors.primary }} />
                        <div>
                          <div className="font-medium">
                            Registration Document
                          </div>
                          <div className="text-sm text-gray-500">
                            Click to view
                          </div>
                        </div>
                      </a>
                    )}
                    {car.insurance_document && (
                      <a
                        href={car.insurance_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <FileText size={20} style={{ color: colors.primary }} />
                        <div>
                          <div className="font-medium">Insurance Document</div>
                          <div className="text-sm text-gray-500">
                            Click to view
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Owner Info and Booking */}
              <div>
                {/* Owner Card */}
                <div
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6 sticky top-6"
                  style={{ borderColor: colors.light }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    About the Owner
                  </h2>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <img
                        src={owner?.photo || "https://via.placeholder.com/80"}
                        alt={owner?.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {owner?.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <User size={14} />
                        {owner?.userType}
                      </div>
                      {owner?.verificationStatus === "Verified" ? (
                        <div className="flex items-center gap-1 text-sm" style={{ color: colors.success }}>
                          <CheckCircle size={14} />
                          Verified User
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                          <AlertCircle size={14} />
                          Unverified User
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {owner?.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={16} className="text-gray-500" />
                        <a
                          href={`tel:${owner.phone}`}
                          className="hover:text-blue-600"
                        >
                          {owner.phone}
                        </a>
                      </div>
                    )}
                    {owner?.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail size={16} className="text-gray-500" />
                        <a
                          href={`mailto:${owner.email}`}
                          className="hover:text-blue-600"
                        >
                          {owner.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {owner?.verificationStatus === "Verified" &&
                    owner?.verificationData && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Verification Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">License No.</div>
                          <div>{owner.verificationData.licenseNumber}</div>
                          <div className="text-gray-500">NID No.</div>
                          <div>{owner.verificationData.nid}</div>
                          <div className="text-gray-500">Verified Since</div>
                          <div>{formatDate(owner.verifiedAt)}</div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Booking Card */}
                <div
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-80"
                  style={{ borderColor: colors.light }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Book This Car
                  </h2>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">
                        ৳{car.rental_details.rental_price_per_day} x 1 day
                      </span>
                      <span className="font-medium">
                        ৳{car.rental_details.rental_price_per_day}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">
                        ৳
                        {(
                          car.rental_details.rental_price_per_day * 0.1
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-3"></div>
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>
                        ৳
                        {(
                          car.rental_details.rental_price_per_day * 1.1
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {userData?.userType === "renter" && (
                    <>
                      <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Continue to Book
                      </button>

                      <BookingModal
                        isOpen={isBookingModalOpen}
                        onClose={() => setIsBookingModalOpen(false)}
                        car={car}
                        owner={owner}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;