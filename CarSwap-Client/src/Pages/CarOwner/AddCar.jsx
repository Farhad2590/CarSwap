import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import useUserData from "../../hooks/useUserData";
import { toast } from "react-toastify";

const AddCar = () => {
  const imgbbApi = "41a71049f5f8bd040846fcf2d7168ed2";
  const { user } = useAuth();
  const { userData, isLoading: isUserDataLoading } = useUserData();
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [formData, setFormData] = useState({
    car_details: {
      car_make: "",
      car_model: "",
      body_style: "",
      number_of_seats: "",
      fuel_type: "",
      transmission_type: "",
      car_color: "",
      mileage: "",
      vehicle_engine_number: "",
      vehicle_number_plate: "",
      year: "",
      car_photos: [],
    },
    rental_details: {
      rental_price_per_day: "",
      minimum_rental_period: "",
      maximum_rental_period: "",
      availability_start_date: "",
      availability_end_date: "",
      pickup_location: "",
      security_deposit_amount: "",
    },
    termsandcondition: {
      air_conditioning: false,
      gps_navigation: false,
      bluetooth_audio: false,
      child_seat: false,
      sunroof: false,
      smoking_allowed: false,
      pets_allowed: false,
      drivers_license_required: true,
      other_features: [],
      fuel_policy: "",
      additional_terms: "",
    },
    registration_document: null,
    insurance_document: null,
    posting_location: "",
    userEmail: "",
    userId: "",
    status: "pending",
    ratings: [],
  });

  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        const ipAddress = response.data.ip;

        const geoResponse = await axios.get(
          `https://ipapi.co/${ipAddress}/json/`
        );
        const locationData = geoResponse.data;

        const locationString = `${locationData.city}, ${locationData.region}, ${locationData.country_name}`;
        setLocation(locationString);
        setFormData((prev) => ({
          ...prev,
          posting_location: locationString,
          rental_details: {
            ...prev.rental_details,
            pickup_location: locationString,
          },
        }));
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation("Location unavailable");
      }
    };

    getUserLocation();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [parent, child] = name.includes(".") ? name.split(".") : [null, name];

    if (parent && formData[parent]) {
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      termsandcondition: {
        ...prev.termsandcondition,
        [name]: prev.termsandcondition[name].includes(value)
          ? prev.termsandcondition[name].filter((item) => item !== value)
          : [...prev.termsandcondition[name], value],
      },
    }));
  };

  const handleImageChange = (e, fieldName) => {
    const { files } = e.target;
    if (files) {
      if (fieldName === "car_photos") {
        setFormData((prev) => ({
          ...prev,
          car_details: {
            ...prev.car_details,
            car_photos: [...Array.from(files)],
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: files[0],
        }));
      }
    }
  };

  // Validation functions for each tab
  const validateTab = (tabIndex) => {
    switch (tabIndex) {
      case 0: // Basic Car Details
        return (
          formData.car_details.car_make &&
          formData.car_details.car_model &&
          formData.car_details.body_style &&
          formData.car_details.number_of_seats &&
          formData.car_details.fuel_type &&
          formData.car_details.transmission_type &&
          formData.car_details.car_color &&
          formData.car_details.year &&
          formData.car_details.mileage &&
          formData.car_details.vehicle_number_plate &&
          formData.car_details.vehicle_engine_number
        );
      case 1: // Rental Details
        return (
          formData.rental_details.rental_price_per_day &&
          formData.rental_details.minimum_rental_period &&
          formData.rental_details.security_deposit_amount &&
          formData.rental_details.availability_start_date &&
          formData.rental_details.pickup_location
        );
      case 2: // Features & Amenities
        return true; // No required fields in this tab
      case 3: // Images & Documents
        return (
          formData.car_details.car_photos.length > 0 &&
          formData.registration_document &&
          formData.insurance_document
        );
      case 4: // Terms & Conditions
        return (
          formData.termsandcondition.fuel_policy &&
          formData.termsandcondition.additional_terms
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateTab(currentTab)) {
      setCurrentTab((prev) => Math.min(prev + 1, 4));
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  const handlePrevious = () => {
    setCurrentTab((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all tabs before submitting
    for (let i = 0; i <= 4; i++) {
      if (!validateTab(i)) {
        toast.error(`Please complete all required fields in step ${i + 1}.`);
        setCurrentTab(i);
        return;
      }
    }

    setLoading(true);

    try {
      // Upload car photos
      const photoUrls = [];
      if (formData.car_details.car_photos.length > 0) {
        for (const photo of formData.car_details.car_photos) {
          const formDataImg = new FormData();
          formDataImg.append("image", photo);

          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
            {
              method: "POST",
              body: formDataImg,
            }
          );

          const result = await response.json();
          if (result.success) {
            photoUrls.push(result.data.url);
          }
        }
      }

      // Upload documents
      let registrationDocUrl = "";
      let insuranceDocUrl = "";

      if (formData.registration_document) {
        const regFormData = new FormData();
        regFormData.append("image", formData.registration_document);
        const regResponse = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
          { method: "POST", body: regFormData }
        );
        const regResult = await regResponse.json();
        if (regResult.success) registrationDocUrl = regResult.data.url;
      }

      if (formData.insurance_document) {
        const insFormData = new FormData();
        insFormData.append("image", formData.insurance_document);
        const insResponse = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgbbApi}`,
          { method: "POST", body: insFormData }
        );
        const insResult = await insResponse.json();
        if (insResult.success) insuranceDocUrl = insResult.data.url;
      }

      const postData = {
        car_details: {
          ...formData.car_details,
          car_photos: photoUrls,
        },
        rental_details: formData.rental_details,
        termsandcondition: formData.termsandcondition,
        registration_document: registrationDocUrl,
        insurance_document: insuranceDocUrl,
        posting_location: formData.posting_location,
        userEmail: user?.email,
        userId: user?._id,
        ratings: [],
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await axios.post("http://localhost:9000/cars/", postData);
      toast.success("Vehicle added successfully!");

      // Reset form
      setFormData({
        car_details: {
          car_make: "",
          car_model: "",
          body_style: "",
          number_of_seats: "",
          fuel_type: "",
          transmission_type: "",
          car_color: "",
          mileage: "",
          vehicle_engine_number: "",
          vehicle_number_plate: "",
          year: "",
          car_photos: [],
        },
        rental_details: {
          rental_price_per_day: "",
          minimum_rental_period: "",
          maximum_rental_period: "",
          availability_start_date: "",
          availability_end_date: "",
          pickup_location: location,
          security_deposit_amount: "",
        },
        termsandcondition: {
          air_conditioning: false,
          gps_navigation: false,
          bluetooth_audio: false,
          child_seat: false,
          sunroof: false,
          smoking_allowed: false,
          pets_allowed: false,
          drivers_license_required: true,
          other_features: [],
          fuel_policy: "",
          additional_terms: "",
        },
        registration_document: null,
        insurance_document: null,
        posting_location: location,
        userEmail: "",
        userId: "",
        status: "pending",
        ratings: [],
      });

      setCurrentTab(0);
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Options arrays
  const carMakes = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Nissan",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Volkswagen",
    "Hyundai",
    "Kia",
    "Mazda",
    "Subaru",
    "Lexus",
    "Acura",
    "Other",
  ];

  const bodyStyles = [
    "Sedan",
    "SUV",
    "Hatchback",
    "Coupe",
    "Convertible",
    "Wagon",
    "Pickup Truck",
    "Van",
    "Minivan",
    "Crossover",
    "Sports Car",
    "Luxury Car",
  ];

  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"];
  const transmissionTypes = ["Automatic", "Manual", "CVT"];
  const seatOptions = ["2", "4", "5", "6", "7", "8", "9+"];
  const fuelPolicies = ["Full-to-Full", "Prepaid", "Same-to-Same", "Flexible"];
  const rentalPeriods = [
    "1 Day",
    "3 Days",
    "1 Week",
    "2 Weeks",
    "1 Month",
    "3 Months",
    "6 Months",
    "1 Year",
  ];
  const otherFeaturesOptions = [
    "Parking Sensors",
    "Backup Camera",
    "Heated Seats",
    "Leather Seats",
    "USB Ports",
    "Wireless Charging",
    "Premium Sound System",
    "Cruise Control",
    "Lane Assist",
    "Automatic Parking",
  ];

  const styles = {
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

  const tabs = [
    {
      id: 0,
      title: "Basic Details",
      subtitle: "Car Information",
      icon: "🚗",
    },
    {
      id: 1,
      title: "Rental Details",
      subtitle: "Pricing & Availability",
      icon: "💰",
    },
    {
      id: 2,
      title: "Features",
      subtitle: "Car Amenities",
      icon: "⭐",
    },
    {
      id: 3,
      title: "Media & Docs",
      subtitle: "Photos & Documents",
      icon: "📷",
    },
    {
      id: 4,
      title: "Terms",
      subtitle: "Rules & Conditions",
      icon: "📋",
    },
  ];

  if (isUserDataLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <div className="inline-flex items-center">
          <svg
            className="animate-spin h-6 w-6 mr-3"
            style={{ color: styles.primary }}
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
          Loading user data...
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Car Make *
                </label>
                <select
                  name="car_details.car_make"
                  value={formData.car_details.car_make}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                >
                  <option value="">Select Car Make</option>
                  {carMakes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Car Model *
                </label>
                <input
                  type="text"
                  name="car_details.car_model"
                  value={formData.car_details.car_model}
                  onChange={handleChange}
                  placeholder="e.g., Corolla, Civic"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Body Style *
                </label>
                <select
                  name="car_details.body_style"
                  value={formData.car_details.body_style}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                >
                  <option value="">Select Body Style</option>
                  {bodyStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Number of Seats *
                </label>
                <select
                  name="car_details.number_of_seats"
                  value={formData.car_details.number_of_seats}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                >
                  <option value="">Select Seats</option>
                  {seatOptions.map((seats) => (
                    <option key={seats} value={seats}>
                      {seats} Seats
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Fuel Type *
                </label>
                <select
                  name="car_details.fuel_type"
                  value={formData.car_details.fuel_type}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                >
                  <option value="">Select Fuel Type</option>
                  {fuelTypes.map((fuel) => (
                    <option key={fuel} value={fuel}>
                      {fuel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Transmission *
                </label>
                <select
                  name="car_details.transmission_type"
                  value={formData.car_details.transmission_type}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                >
                  <option value="">Select Transmission</option>
                  {transmissionTypes.map((trans) => (
                    <option key={trans} value={trans}>
                      {trans}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Car Color *
                </label>
                <input
                  type="text"
                  name="car_details.car_color"
                  value={formData.car_details.car_color}
                  onChange={handleChange}
                  placeholder="e.g., White, Black, Silver"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Year *
                </label>
                <input
                  type="number"
                  name="car_details.year"
                  value={formData.car_details.year}
                  onChange={handleChange}
                  placeholder="e.g., 2023"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Mileage (km) *
                </label>
                <input
                  type="number"
                  name="car_details.mileage"
                  value={formData.car_details.mileage}
                  onChange={handleChange}
                  placeholder="e.g., 25000"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  License Plate Number *
                </label>
                <input
                  type="text"
                  name="car_details.vehicle_number_plate"
                  value={formData.car_details.vehicle_number_plate}
                  onChange={handleChange}
                  placeholder="e.g., ABC-1234"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Engine Number *
                </label>
                <input
                  type="text"
                  name="car_details.vehicle_engine_number"
                  value={formData.car_details.vehicle_engine_number}
                  onChange={handleChange}
                  placeholder="Vehicle engine number"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Rental Price per Day (USD) *
                </label>
                <input
                  type="number"
                  name="rental_details.rental_price_per_day"
                  value={formData.rental_details.rental_price_per_day}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Minimum Rental Period *
                </label>
                <select
                  name="rental_details.minimum_rental_period"
                  value={formData.rental_details.minimum_rental_period}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                >
                  <option value="">Select Minimum Period</option>
                  {rentalPeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Maximum Rental Period
                </label>
                <select
                  name="rental_details.maximum_rental_period"
                  value={formData.rental_details.maximum_rental_period}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  <option value="">Select Maximum Period</option>
                  {rentalPeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Security Deposit (USD) *
                </label>
                <input
                  type="number"
                  name="rental_details.security_deposit_amount"
                  value={formData.rental_details.security_deposit_amount}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Availability Start Date *
                </label>
                <input
                  type="date"
                  name="rental_details.availability_start_date"
                  value={formData.rental_details.availability_start_date}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Availability End Date
                </label>
                <input
                  type="date"
                  name="rental_details.availability_end_date"
                  value={formData.rental_details.availability_end_date}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                />
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Pick-up Location *
                </label>
                <input
                  type="text"
                  name="rental_details.pickup_location"
                  value={formData.rental_details.pickup_location}
                  onChange={handleChange}
                  placeholder="Enter pick-up address"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e2e8f0" }}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsandcondition.air_conditioning"
                  checked={formData.termsandcondition.air_conditioning}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: styles.primary }}
                />
                <span className="text-sm">Air Conditioning</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsandcondition.gps_navigation"
                  checked={formData.termsandcondition.gps_navigation}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: styles.primary }}
                />
                <span className="text-sm">GPS/Navigation</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsandcondition.bluetooth_audio"
                  checked={formData.termsandcondition.bluetooth_audio}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: styles.primary }}
                />
                <span className="text-sm">Bluetooth/Audio</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsandcondition.child_seat"
                  checked={formData.termsandcondition.child_seat}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: styles.primary }}
                />
                <span className="text-sm">Child Seat</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsandcondition.sunroof"
                  checked={formData.termsandcondition.sunroof}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: styles.primary }}
                />
                <span className="text-sm">Sunroof</span>
              </label>
            </div>

            <div>
              <label
                className="block mb-2 font-medium"
                style={{ color: styles.dark }}
              >
                Other Features (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {otherFeaturesOptions.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.termsandcondition.other_features.includes(
                        feature
                      )}
                      onChange={() =>
                        handleMultiSelect("other_features", feature)
                      }
                      className="w-4 h-4 rounded"
                      style={{ accentColor: styles.primary }}
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label
                className="block mb-2 font-medium"
                style={{ color: styles.dark }}
              >
                Car Photos * (Minimum 3 photos)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4"
                      style={{ color: styles.textLight }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p
                      className="mb-2 text-sm"
                      style={{ color: styles.textLight }}
                    >
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs" style={{ color: styles.textLight }}>
                      PNG, JPG, JPEG (MAX. 5MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, "car_photos")}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                </label>
              </div>

              {formData.car_details.car_photos.length > 0 && (
                <div className="mt-4">
                  <h4
                    className="text-sm font-medium mb-2"
                    style={{ color: styles.dark }}
                  >
                    Selected Photos ({formData.car_details.car_photos.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array.from(formData.car_details.car_photos).map(
                      (photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Car preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                car_details: {
                                  ...prev.car_details,
                                  car_photos:
                                    prev.car_details.car_photos.filter(
                                      (_, i) => i !== index
                                    ),
                                },
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Registration Document *
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4"
                        style={{ color: styles.textLight }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <p
                        className="mb-2 text-sm"
                        style={{ color: styles.textLight }}
                      >
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: styles.textLight }}
                      >
                        PDF, PNG, JPG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={(e) =>
                        handleImageChange(e, "registration_document")
                      }
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>
                </div>
                {formData.registration_document && (
                  <div
                    className="mt-2 text-sm"
                    style={{ color: styles.success }}
                  >
                    ✓ {formData.registration_document.name} selected
                  </div>
                )}
              </div>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ color: styles.dark }}
                >
                  Insurance Document *
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4"
                        style={{ color: styles.textLight }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <p
                        className="mb-2 text-sm"
                        style={{ color: styles.textLight }}
                      >
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: styles.textLight }}
                      >
                        PDF, PNG, JPG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={(e) =>
                        handleImageChange(e, "insurance_document")
                      }
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>
                </div>
                {formData.insurance_document && (
                  <div
                    className="mt-2 text-sm"
                    style={{ color: styles.success }}
                  >
                    ✓ {formData.insurance_document.name} selected
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label
                className="block mb-2 font-medium"
                style={{ color: styles.dark }}
              >
                Fuel Policy *
              </label>
              <select
                name="termsandcondition.fuel_policy"
                value={formData.termsandcondition.fuel_policy}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: "#e2e8f0" }}
                required
              >
                <option value="">Select Fuel Policy</option>
                {fuelPolicies.map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block mb-2 font-medium"
                style={{ color: styles.dark }}
              >
                Additional Terms & Conditions *
              </label>
              <textarea
                name="termsandcondition.additional_terms"
                value={formData.termsandcondition.additional_terms}
                onChange={handleChange}
                placeholder="Any additional rules or rental conditions..."
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: "#e2e8f0" }}
                required
                rows={5}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form
      className="max-w-5xl mx-auto px-4 py-10 bg-white rounded-lg shadow"
      onSubmit={handleSubmit}
    >
      <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: styles.primary }}
      >
        Add New Car
      </h1>
      <div className="flex justify-center mb-8">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            type="button"
            className={`flex flex-col items-center px-4 py-2 transition-colors duration-200 ${
              currentTab === idx
                ? "bg-[#0d786d] text-white"
                : "bg-gray-100 text-gray-800"
            } rounded-lg mx-1`}
            onClick={() => setCurrentTab(idx)}
            disabled={idx > currentTab}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="font-semibold text-sm">{tab.title}</span>
            <span className="text-xs">{tab.subtitle}</span>
          </button>
        ))}
      </div>

      <div className="mb-8">{renderTabContent()}</div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-2 rounded bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300"
          disabled={currentTab === 0}
        >
          Previous
        </button>
        {currentTab < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 rounded bg-[#0d786d] text-white font-semibold hover:bg-[#076158]"
            disabled={loading}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="px-6 py-2 rounded bg-[#0d786d] text-white font-semibold hover:bg-[#076158]"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
};

export default AddCar;
