import React, { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, DollarSign, Eye, Star, User, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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

const BrowseCars = () => {
  const [cars, setCars] = useState([]);
  const [userVerificationStatus, setUserVerificationStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'approved', 
    search: '',
    location: '',
    priceRange: '',
    carMake: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  // const navigate = useNavigate(); // Would be used in actual implementation

  const fetchUserVerificationStatus = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:9000/users/${userEmail}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      return userData.verificationStatus || 'Unverified';
    } catch (err) {
      console.error('Error fetching user verification status:', err);
      return 'Unverified';
    }
  };

  const fetchBrowseCars = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      
      const response = await fetch(`http://localhost:9000/cars?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch car posts');
      }
      
      const data = await response.json();
      setCars(data);

      // Fetch verification status for each user
      const verificationStatusMap = {};
      for (const car of data) {
        if (car.userEmail) {
          verificationStatusMap[car.userEmail] = await fetchUserVerificationStatus(car.userEmail);
        }
      }
      setUserVerificationStatus(verificationStatusMap);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrowseCars();
  }, [filters.status]);

  const filteredCars = cars.filter(car => {
    const matchesSearch = !filters.search || 
      `${car.car_details?.car_make} ${car.car_details?.car_model}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      car.posting_location.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLocation = !filters.location || 
      car.posting_location.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesMake = !filters.carMake || 
      car.car_details?.car_make?.toLowerCase().includes(filters.carMake.toLowerCase());
    
    const matchesPrice = !filters.priceRange || (() => {
      const price = parseInt(car.rental_details?.rental_price_per_day || 0);
      switch (filters.priceRange) {
        case 'under-100': return price < 100;
        case '100-300': return price >= 100 && price <= 300;
        case '300-500': return price >= 300 && price <= 500;
        case 'over-500': return price > 500;
        default: return true;
      }
    })();

    return matchesSearch && matchesLocation && matchesMake && matchesPrice;
  });

  const getVerificationBadge = (userEmail) => {
    const status = userVerificationStatus[userEmail] || 'Unverified';
    if (status === "Verified") {
      return (
        <div 
          className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{ backgroundColor: colors.light, color: colors.primary }}
        >
          <CheckCircle size={12} />
          Verified User
        </div>
      );
    } else {
      return (
        <div 
          className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{ backgroundColor: '#fef3c7', color: colors.warning }}
        >
          <AlertCircle size={12} />
          Unverified User
        </div>
      );
    }
  };

  const handleViewDetails = (carId) => {
    // navigate(`/cars/${carId}`); // Would navigate in actual implementation
    console.log('Navigate to car details:', carId);
  };

  const uniqueCarMakes = [...new Set(cars.map(car => car.car_details?.car_make).filter(Boolean))];
  const uniqueLocations = [...new Set(cars.map(car => car.posting_location.split(',')[0]).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderBottomColor: colors.primary }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 mb-4" style={{ color: colors.danger }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>Error Loading Cars</h3>
          <p className="mb-4" style={{ color: colors.textLight }}>{error}</p>
          <button 
            onClick={fetchBrowseCars}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: colors.primary }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: colors.light }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-4" style={{ color: colors.text }}>
            <Car style={{ color: colors.primary }} size={32} />
            Available Cars for Rent
          </h1>
          
          <div 
            className="border rounded-lg p-4 mb-6"
            style={{ backgroundColor: colors.light, borderColor: colors.secondary }}
          >
            <div className="flex items-center gap-2" style={{ color: colors.primary }}>
              <CheckCircle size={20} />
              <span className="font-medium">Verified owners cars are shown first</span>
            </div>
            <p className="text-sm mt-1" style={{ color: colors.accent }}>
              Cars from verified owners appear at the top for your safety and security.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textLight }} size={20} />
                <input
                  type="text"
                  placeholder="Search by car make, model, or location..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': colors.primary,
                    focusRingColor: colors.primary
                  }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                style={{ backgroundColor: colors.light, color: colors.text }}
              >
                <Filter size={20} />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Car Make</label>
                  <select
                    value={filters.carMake}
                    onChange={(e) => setFilters({...filters, carMake: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="">All Makes</option>
                    {uniqueCarMakes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="">All Prices</option>
                    <option value="under-100">Under ৳100</option>
                    <option value="100-300">৳100 - ৳300</option>
                    <option value="300-500">৳300 - ৳500</option>
                    <option value="over-500">Over ৳500</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      status: 'approved',
                      search: '',
                      location: '',
                      priceRange: '',
                      carMake: ''
                    })}
                    className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: colors.textLight }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p style={{ color: colors.textLight }}>
              Showing {filteredCars.length} of {cars.length} cars
            </p>
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
              <CheckCircle size={16} style={{ color: colors.primary }} />
              <span>{Object.values(userVerificationStatus).filter(status => status === 'Verified').length} verified owners</span>
            </div>
          </div>
        </div>

        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 mb-4" style={{ color: colors.textLight }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>No cars found</h3>
            <p className="mb-4" style={{ color: colors.textLight }}>
              Try adjusting your search criteria or filters.
            </p>
            <button 
              onClick={() => setFilters({
                status: 'approved',
                search: '',
                location: '',
                priceRange: '',
                carMake: ''
              })}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: colors.primary }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const carId = car._id?.$oid || car._id;
              const isVerified = userVerificationStatus[car.userEmail] === 'Verified';
              
              return (
                <div 
                  key={carId} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300`}
                  style={isVerified ? { 
                    border: `2px solid ${colors.secondary}`,
                    boxShadow: `0 0 0 1px ${colors.primary}20`
                  } : {}}
                >
                  
                  <div className="relative h-48 bg-gray-200">
                    {car.car_details?.car_photos && car.car_details.car_photos.length > 0 ? (
                      <img
                        src={car.car_details.car_photos[0]}
                        alt={`${car.car_details?.car_make} ${car.car_details?.car_model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car style={{ color: colors.textLight }} size={48} />
                      </div>
                    )}
                    
                    {car.userEmail && getVerificationBadge(car.userEmail)}

                    {isVerified && (
                      <div 
                        className="absolute top-3 right-3 px-2 py-1 text-white rounded-full text-xs font-medium flex items-center gap-1"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                        }}
                      >
                        <Star size={12} />
                        PRIORITY
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                        {car.car_details?.car_make} {car.car_details?.car_model}
                        {isVerified && <CheckCircle size={16} style={{ color: colors.primary }} />}
                      </h3>
                      <p className="text-sm" style={{ color: colors.textLight }}>
                        {car.car_details?.year} • {car.car_details?.body_style} • {car.car_details?.fuel_type}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} style={{ color: colors.success }} />
                        <span className="font-semibold" style={{ color: colors.success }}>৳{car.rental_details?.rental_price_per_day}/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
                        <MapPin size={16} />
                        <span>{car.posting_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
                        <Calendar size={16} />
                        <span>Available: {new Date(car.rental_details?.availability_start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
                        <User size={16} />
                        <span>Seats: {car.car_details?.number_of_seats}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {car.termsandcondition?.air_conditioning && (
                          <span 
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: colors.light, color: colors.primary }}
                          >
                            AC
                          </span>
                        )}
                        {car.termsandcondition?.gps_navigation && (
                          <span 
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: '#dcfce7', color: colors.success }}
                          >
                            GPS
                          </span>
                        )}
                        {car.termsandcondition?.bluetooth_audio && (
                          <span 
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: '#f3e8ff', color: colors.secondary }}
                          >
                            Bluetooth
                          </span>
                        )}
                      </div>
                    </div>

                     <Link 
                      to={`/cars/${carId}`}
                      className="block w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Eye size={16} />
                      View Details & Book
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCars;