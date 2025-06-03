import React, { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, DollarSign, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

const MyCar = () => {
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Get user email from localStorage or context (replace with your auth logic)
  useEffect(() => {
    // Replace this with your actual user authentication logic
    const email = localStorage.getItem('userEmail') || 'farhadhossen2590@gmail.com';
    setUserEmail(email);
  }, []);

  // Fetch user's car posts
  const fetchMyCars = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:9000/cars/owner/${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch car posts');
      }
      
      const data = await response.json();
      setMyCars(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user verification status
  const fetchVerificationStatus = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`http://localhost:9000/api/cars/user/verification-status/${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchMyCars();
      fetchVerificationStatus();
    }
  }, [userEmail]);

  // Filter cars based on active tab
  const filteredCars = myCars.filter(car => {
    if (activeTab === 'all') return true;
    return car.status === activeTab;
  });

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-100', icon: Clock, text: 'Pending Review' };
      case 'approved':
        return { color: 'text-green-600 bg-green-100', icon: CheckCircle, text: 'Approved' };
      case 'rejected':
        return { color: 'text-red-600 bg-red-100', icon: XCircle, text: 'Rejected' };
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: AlertCircle, text: 'Unknown' };
    }
  };

  // Get verification badge
  const getVerificationBadge = () => {
    if (!verificationStatus) return null;
    
    if (verificationStatus.isVerified) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          <CheckCircle size={16} />
          <span>Verified User</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          <AlertCircle size={16} />
          <span>Unverified User</span>
        </div>
      );
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car post?')) return;
    
    try {
      const response = await fetch(`http://localhost:9000/api/cars/${carId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMyCars(myCars.filter(car => car._id !== carId));
      } else {
        throw new Error('Failed to delete car post');
      }
    } catch (err) {
      alert('Error deleting car post: ' + err.message);
    }
  };

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
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Cars</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMyCars}
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Car className="text-blue-600" size={32} />
                My Car Posts
              </h1>
              <p className="text-gray-600 mt-1">Manage your car rental listings</p>
            </div>
            {getVerificationBadge()}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{myCars.length}</p>
                </div>
                <Car className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {myCars.filter(car => car.status === 'pending').length}
                  </p>
                </div>
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {myCars.filter(car => car.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {myCars.filter(car => car.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Posts', count: myCars.length },
                { key: 'pending', label: 'Pending', count: myCars.filter(car => car.status === 'pending').length },
                { key: 'approved', label: 'Approved', count: myCars.filter(car => car.status === 'approved').length },
                { key: 'rejected', label: 'Rejected', count: myCars.filter(car => car.status === 'rejected').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Car Posts Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'all' ? '' : activeTab} car posts
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' 
                ? "You haven't created any car posts yet."
                : `You don't have any ${activeTab} car posts.`
              }
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create New Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const statusInfo = getStatusInfo(car.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={car._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Car Image */}
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
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon size={12} />
                      {statusInfo.text}
                    </div>

                    {/* Verification Badge */}
                    {car.verificationStatus === 'verified' && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <User size={12} />
                        Verified Owner
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {car.car_details?.car_make} {car.car_details?.car_model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {car.car_details?.year} • {car.car_details?.body_style}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign size={16} />
                        <span>৳{car.rental_details?.rental_price_per_day}/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>{car.posting_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Posted: {new Date(car.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {car.status === 'rejected' && car.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {car.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1  bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Eye size={16} />
                        
                      </button>
                      
                      {car.status === 'pending' || car.status === 'rejected' ? (
                        <button className=" bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                          <Edit size={16} />
                          
                        </button>
                      ) : null}
                      
                      <button 
                        onClick={() => handleDeleteCar(car._id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        
                      </button>
                    </div>
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

export default MyCar;