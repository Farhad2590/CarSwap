import React, { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, DollarSign, Eye, Star, User, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
  const navigate = useNavigate();

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
        <div className="absolute top-3 left-3 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle size={12} />
          Verified User
        </div>
      );
    } else {
      return (
        <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
          <AlertCircle size={12} />
          Unverified User
        </div>
      );
    }
  };

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const uniqueCarMakes = [...new Set(cars.map(car => car.car_details?.car_make).filter(Boolean))];
  const uniqueLocations = [...new Set(cars.map(car => car.posting_location.split(',')[0]).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Cars</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchBrowseCars}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
            <Car className="text-blue-600" size={32} />
            Available Cars for Rent
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle size={20} />
              <span className="font-medium">Verified owners cars are shown first</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Cars from verified owners appear at the top for your safety and security.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by car make, model, or location..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Filter size={20} />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Make</label>
                  <select
                    value={filters.carMake}
                    onChange={(e) => setFilters({...filters, carMake: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Makes</option>
                    {uniqueCarMakes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {filteredCars.length} of {cars.length} cars
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} className="text-blue-600" />
              <span>{Object.values(userVerificationStatus).filter(status => status === 'Verified').length} verified owners</span>
            </div>
          </div>
        </div>

        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600 mb-4">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    isVerified ? 'ring-2 ring-blue-200 border-blue-300' : ''
                  }`}
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
                        <Car className="text-gray-400" size={48} />
                      </div>
                    )}
                    
                    {car.userEmail && getVerificationBadge(car.userEmail)}

                    {isVerified && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={12} />
                        PRIORITY
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {car.car_details?.car_make} {car.car_details?.car_model}
                        {isVerified && <CheckCircle size={16} className="text-blue-600" />}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {car.car_details?.year} • {car.car_details?.body_style} • {car.car_details?.fuel_type}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-semibold text-green-600">৳{car.rental_details?.rental_price_per_day}/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>{car.posting_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Available: {new Date(car.rental_details?.availability_start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} />
                        <span>Seats: {car.car_details?.number_of_seats}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {car.termsandcondition?.air_conditioning && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">AC</span>
                        )}
                        {car.termsandcondition?.gps_navigation && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">GPS</span>
                        )}
                        {car.termsandcondition?.bluetooth_audio && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Bluetooth</span>
                        )}
                      </div>
                    </div>

                    <Link 
                      to={`/cars/${carId}`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-center"
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