// import { MapPin, Star } from "lucide-react";
// import { useState, useRef, useEffect, useCallback } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { Loader } from "@googlemaps/js-api-loader";

// // Mock car data
// const carsData = {
//   "tesla-model-3": {
//     name: "Tesla Model 3",
//     image: "https://via.placeholder.com/600x300?text=Tesla+Model+3",
//     price: 75,
//     rating: 4.9,
//     location: "New York",
//   },
//   "bmw-3-series": {
//     name: "BMW 3 Series",
//     image: "https://via.placeholder.com/600x300?text=BMW+3+Series",
//     price: 65,
//     rating: 4.8,
//     location: "Los Angeles",
//   },
//   "toyota-camry": {
//     name: "Toyota Camry",
//     image: "https://via.placeholder.com/600x300?text=Toyota+Camry",
//     price: 45,
//     rating: 4.7,
//     location: "Chicago",
//   },
// };

// // Map container style
// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// export default function BookingPage() {
//   const { carId } = useParams();
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     pickupLocation: "",
//     dropoffLocation: "",
//     pickupDate: "",
//     returnDate: "",
//     days: 1,
//   });

//   // Google Maps API loading state
//   const [mapsLoaded, setMapsLoaded] = useState(false);
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const pickupInputRef = useRef(null);
//   const dropoffInputRef = useRef(null);
//   const pickupAutocompleteRef = useRef(null);
//   const dropoffAutocompleteRef = useRef(null);
//   const directionsServiceRef = useRef(null);
//   const directionsRendererRef = useRef(null);
  
//   const [pickupPlace, setPickupPlace] = useState(null);
//   const [dropoffPlace, setDropoffPlace] = useState(null);
//   const [center] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

//   // Load Google Maps API - only run once
//   useEffect(() => {
//     // API key should come from environment variable in production
//     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";
    
//     const loader = new Loader({
//       apiKey,
//       version: "weekly",
//       libraries: ["places"]
//     });

//     loader.load()
//       .then(() => {
//         console.log("Google Maps API loaded successfully");
//         setMapsLoaded(true);
//       })
//       .catch(error => {
//         console.error("Error loading Google Maps API:", error);
//       });
      
//     // Cleanup function
//     return () => {
//       // Clean up any Google Maps instances if needed
//       if (directionsRendererRef.current) {
//         directionsRendererRef.current.setMap(null);
//       }
//     };
//   }, []);

//   // Calculate route between two places
//   const calculateRoute = useCallback((origin, destination) => {
//     if (!directionsServiceRef.current || !directionsRendererRef.current) return;
    
//     directionsServiceRef.current.route({
//       origin: { placeId: origin.place_id },
//       destination: { placeId: destination.place_id },
//       travelMode: window.google.maps.TravelMode.DRIVING,
//     }, (response, status) => {
//       if (status === 'OK') {
//         directionsRendererRef.current.setDirections(response);
        
//         const route = response.routes[0];
//         if (route && route.legs && route.legs[0]) {
//           const leg = route.legs[0];
//           console.log(`Distance: ${leg.distance.text}, Duration: ${leg.duration.text}`);
//         }
//       } else {
//         console.error('Directions request failed due to ' + status);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (!mapsLoaded || !window.google || step !== 1) return;
    
//     const mapContainer = document.getElementById('google-map');
//     if (!mapContainer) return;
    
//     const map = new window.google.maps.Map(mapContainer, {
//       center,
//       zoom: 10,
//       mapTypeControl: false,
//     });
//     mapInstanceRef.current = map;
    
//     directionsServiceRef.current = new window.google.maps.DirectionsService();
//     directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
//       map,
//       suppressMarkers: false,
//     });
    
//     if (pickupInputRef.current) {
//       const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInputRef.current, {
//         types: ['address'],
//       });
//       pickupAutocompleteRef.current = pickupAutocomplete;
      
//       pickupAutocomplete.addListener('place_changed', () => {
//         const place = pickupAutocomplete.getPlace();
//         if (!place.geometry) {
//           console.log("No location data for the selected place");
//           return;
//         }
        
//         setPickupPlace(place);
//         setFormData(prev => ({
//           ...prev,
//           pickupLocation: place.formatted_address || ""
//         }));
        
//         if (dropoffPlace) {
//           calculateRoute(place, dropoffPlace);
//         } else {
//           map.setCenter(place.geometry.location);
//           map.setZoom(15);
//         }
//       });
//     }
    
//     if (dropoffInputRef.current) {
//       const dropoffAutocomplete = new window.google.maps.places.Autocomplete(dropoffInputRef.current, {
//         types: ['address'],
//       });
//       dropoffAutocompleteRef.current = dropoffAutocomplete;
      
//       dropoffAutocomplete.addListener('place_changed', () => {
//         const place = dropoffAutocomplete.getPlace();
//         if (!place.geometry) {
//           console.log("No location data for the selected place");
//           return;
//         }
        
//         setDropoffPlace(place);
//         setFormData(prev => ({
//           ...prev,
//           dropoffLocation: place.formatted_address || ""
//         }));
        
//         // Adjust map and calculate route if both places selected
//         if (pickupPlace) {
//           calculateRoute(pickupPlace, place);
//         } else {
//           map.setCenter(place.geometry.location);
//           map.setZoom(15);
//         }
//       });
//     }
    
//     return () => {
//       if (mapInstanceRef.current && directionsRendererRef.current) {
//         directionsRendererRef.current.setMap(null);
//       }
//     };
//   }, [mapsLoaded, center, calculateRoute, step]);

//   useEffect(() => {
//     if (formData.pickupDate && formData.returnDate) {
//       const pickup = new Date(formData.pickupDate);
//       const dropoff = new Date(formData.returnDate);
//       const diffTime = Math.abs(dropoff - pickup);
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
//       setFormData(prev => ({
//         ...prev,
//         days: diffDays > 0 ? diffDays : 1
//       }));
//     }
//   }, [formData.pickupDate, formData.returnDate]);

//   const car = carsData[carId];

//   if (!car) {
//     return <div className="p-6 text-red-500">Car not found</div>;
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setStep(2);
//   };

//   const handlePayment = (e) => {
//     e.preventDefault();
//     alert("Payment processed! Redirecting...");
//     navigate(`/booking/${carId}/confirmation`);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <header className="mb-8">
//         <Link to="/" className="text-teal-500 hover:underline mb-4 inline-block">
//           &larr; Back to cars
//         </Link>
//         <h1 className="text-3xl font-bold text-gray-800">Book Your Car</h1>
//       </header>

//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="lg:w-2/3">
//           {step === 1 && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trip Details</h2>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label htmlFor="pickupLocation" className="block text-gray-700 mb-2">
//                       Pickup Location
//                     </label>
//                     <input
//                       ref={pickupInputRef}
//                       type="text"
//                       id="pickupLocation"
//                       name="pickupLocation"
//                       value={formData.pickupLocation}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       placeholder="Enter pickup location"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="dropoffLocation" className="block text-gray-700 mb-2">
//                       Drop-off Location
//                     </label>
//                     <input
//                       ref={dropoffInputRef}
//                       type="text"
//                       id="dropoffLocation"
//                       name="dropoffLocation"
//                       value={formData.dropoffLocation}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       placeholder="Enter drop-off location"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="pickupDate" className="block text-gray-700 mb-2">
//                       Pickup Date
//                     </label>
//                     <input
//                       type="date"
//                       id="pickupDate"
//                       name="pickupDate"
//                       value={formData.pickupDate}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="returnDate" className="block text-gray-700 mb-2">
//                       Return Date
//                     </label>
//                     <input
//                       type="date"
//                       id="returnDate"
//                       name="returnDate"
//                       value={formData.returnDate}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-8">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Preview</h3>
//                   <div className="rounded-lg h-64 overflow-hidden">
//                     {step === 1 && (
//                       <div id="google-map" style={containerStyle} className="bg-gray-100">
//                         {!mapsLoaded && (
//                           <div className="h-full flex items-center justify-center">
//                             <p className="text-gray-500">Loading Google Maps...</p>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-sm text-gray-500 mt-2">Enter both locations to see your route</p>
//                 </div>

//                 <button
//                   type="submit"
//                   className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-md transition duration-300 w-full md:w-auto"
//                 >
//                   Continue to Payment
//                 </button>
//               </form>
//             </div>
//           )}

//           {step === 2 && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Details</h2>

//               <form onSubmit={handlePayment} className="space-y-6">
//                 <div className="grid grid-cols-1 gap-6">
//                   <div>
//                     <label htmlFor="cardName" className="block text-gray-700 mb-2">
//                       Name on Card
//                     </label>
//                     <input
//                       type="text"
//                       id="cardName"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       placeholder="John Doe"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="cardNumber" className="block text-gray-700 mb-2">
//                       Card Number
//                     </label>
//                     <input
//                       type="text"
//                       id="cardNumber"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       placeholder="1234 5678 9012 3456"
//                       required
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label htmlFor="expiryDate" className="block text-gray-700 mb-2">
//                         Expiry Date
//                       </label>
//                       <input
//                         type="text"
//                         id="expiryDate"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         placeholder="MM/YY"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="cvv" className="block text-gray-700 mb-2">
//                         CVV
//                       </label>
//                       <input
//                         type="text"
//                         id="cvv"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         placeholder="123"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Address</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label htmlFor="address" className="block text-gray-700 mb-2">
//                         Address
//                       </label>
//                       <input
//                         type="text"
//                         id="address"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         placeholder="123 Main St"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="city" className="block text-gray-700 mb-2">
//                         City
//                       </label>
//                       <input
//                         type="text"
//                         id="city"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         placeholder="New York"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="zipCode" className="block text-gray-700 mb-2">
//                         Zip Code
//                       </label>
//                       <input
//                         type="text"
//                         id="zipCode"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         placeholder="10001"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="country" className="block text-gray-700 mb-2">
//                         Country
//                       </label>
//                       <input
//                         type="text"
//                         id="country"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         placeholder="United States"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-md transition duration-300 w-full md:w-auto"
//                 >
//                   Complete Booking
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>

//         <div className="lg:w-1/3">
//           <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
//             <div className="h-48 relative">
//               <img src={car.image || "/placeholder.svg"} alt={car.name} className="w-full h-full object-cover" />
//             </div>
//             <div className="p-4">
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-xl font-semibold">{car.name}</h3>
//                 <div className="flex items-center">
//                   <Star className="w-5 h-5 text-yellow-400 fill-current" />
//                   <span className="ml-1 text-gray-700">{car.rating}</span>
//                 </div>
//               </div>
//               <div className="flex items-center text-gray-600 mb-4">
//                 <MapPin className="w-4 h-4 mr-1" />
//                 <span>{car.location}</span>
//               </div>

//               <div className="border-t border-gray-200 pt-4 mt-4">
//                 <h4 className="font-semibold text-gray-800 mb-4">Booking Summary</h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Daily Rate:</span>
//                     <span className="font-medium">${car.price}/day</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Rental Period:</span>
//                     <span className="font-medium">{formData.days} days</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Subtotal:</span>
//                     <span className="font-medium">${car.price * formData.days}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Taxes & Fees:</span>
//                     <span className="font-medium">${Math.round(car.price * formData.days * 0.15)}</span>
//                   </div>
//                 </div>
//                 <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
//                   <span className="font-semibold">Total:</span>
//                   <span className="font-bold text-xl text-teal-500">
//                     ${car.price * formData.days + Math.round(car.price * formData.days * 0.15)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { MapPin, Star } from "lucide-react";
import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GoogleMap, LoadScript, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";

const center = { lat: 23.8103, lng: 90.4125 }; 

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Mock car data
const carsData = {
  "tesla-model-3": {
    name: "Tesla Model 3",
    image: "https://via.placeholder.com/600x300?text=Tesla+Model+3",
    price: 75,
    rating: 4.9,
    location: "New York",
  },
  "bmw-3-series": {
    name: "BMW 3 Series",
    image: "https://via.placeholder.com/600x300?text=BMW+3+Series",
    price: 65,
    rating: 4.8,
    location: "Los Angeles",
  },
  "toyota-camry": {
    name: "Toyota Camry",
    image: "https://via.placeholder.com/600x300?text=Toyota+Camry",
    price: 45,
    rating: 4.7,
    location: "Chicago",
  },
};

export default function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    returnDate: "",
    days: 1,
  });

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [directions, setDirections] = useState(null);

  const pickupRef = useRef();
  const dropoffRef = useRef();

  const calculateRoute = () => {
    if (!pickup || !dropoff) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Error fetching directions", result);
        }
      }
    );
  };

  const car = carsData[carId];

  if (!car) {
    return <div className="p-6 text-red-500">Car not found</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Calculate days when dates change
    if (name === "pickupDate" || name === "returnDate") {
      if (formData.pickupDate && (name === "returnDate" ? value : formData.returnDate)) {
        const pickup = new Date(formData.pickupDate);
        const returnDate = new Date(name === "returnDate" ? value : formData.returnDate);
        const timeDiff = returnDate - pickup;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          setFormData(prev => ({ ...prev, days: daysDiff }));
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    
    // Log booking data (not payment data)
    const bookingData = {
      carDetails: {
        id: carId,
        name: car.name,
        price: car.price,
        location: car.location
      },
      tripDetails: {
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        rentalDays: formData.days
      },
      bookingCost: {
        dailyRate: car.price,
        subtotal: car.price * formData.days,
        taxesAndFees: Math.round(car.price * formData.days * 0.15),
        total: car.price * formData.days + Math.round(car.price * formData.days * 0.15)
      },
      bookingTime: new Date().toISOString()
    };
    
    console.log("Booking Data:", bookingData);
    
    // You could also send this data to your backend API
    // Example:
    // fetch('/api/bookings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(bookingData)
    // });
    
    // Navigate to confirmation page
    navigate(`/booking/${carId}/confirmation`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <Link to="/" className="text-teal-500 hover:underline mb-4 inline-block">
          &larr; Back to cars
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Book Your Car</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trip Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <LoadScript>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-gray-700 mb-2">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      id="pickupLocation"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter pickup location"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="dropoffLocation" className="block text-gray-700 mb-2">
                      Drop-off Location
                    </label>
                    <input
                      type="text"
                      id="dropoffLocation"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter drop-off location"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pickupDate" className="block text-gray-700 mb-2">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="returnDate" className="block text-gray-700 mb-2">
                      Return Date
                    </label>
                    <input
                      type="date"
                      id="returnDate"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Preview</h3>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <p className="text-gray-500">Map will be displayed here after location selection</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Google Maps integration will show your route</p>
                </div>

                </LoadScript>
                

                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-md transition duration-300 w-full md:w-auto"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Details</h2>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="cardName" className="block text-gray-700 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="block text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address" className="block text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-md transition duration-300 w-full md:w-auto"
                >
                  Complete Booking
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
            <div className="h-48 relative">
              <img src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">{car.name}</h3>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-700">{car.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{car.location}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-4">Booking Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-medium">${car.price}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Period:</span>
                    <span className="font-medium">{formData.days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${car.price * formData.days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees:</span>
                    <span className="font-medium">${Math.round(car.price * formData.days * 0.15)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-xl text-teal-500">
                    ${car.price * formData.days + Math.round(car.price * formData.days * 0.15)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}