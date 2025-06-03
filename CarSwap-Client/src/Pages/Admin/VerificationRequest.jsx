import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Edit, Trash2, Save, X, CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar, FileText, Image, Car, CreditCard, Hash, MessageSquare } from "lucide-react";

// Color palette
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

const VerificationRequest = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const api = "http://localhost:9000";

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/verifications/pending`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const handleEditStatus = (userId, currentStatus) => {
    setEditingUserId(userId);
    setNewStatus(currentStatus);
  };

  const handleStatusUpdate = async (userId) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      await axios.put(`${api}/verifications/${user.userType}/${user._id}`, {
        status: newStatus,
        adminNotes: adminRemarks,
      });

      setUsers(
        users.map((u) =>
          u._id === userId
            ? {
                ...u,
                verificationStatus: "Verified",
                verificationData: {
                  ...u.verificationData,
                  status: newStatus,
                  adminRemarks: adminRemarks,
                  verifiedAt: new Date().toISOString,
                },
              }
            : u
        )
      );
      setEditingUserId(null);
      fetchAllUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${api}/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      verified: { bg: colors.success, text: 'white' },
      rejected: { bg: colors.danger, text: 'white' },
      pending: { bg: colors.warning, text: 'white' }
    };
    
    const statusColor = statusColors[status?.toLowerCase()] || statusColors.pending;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
      >
        {getStatusIcon(status)}
        {status || 'Pending'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
      <span className="ml-3 text-lg" style={{ color: colors.text }}>Loading users...</span>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8 px-4">
      <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.danger }} />
      <p className="text-lg font-medium" style={{ color: colors.danger }}>Error: {error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
          Verification Management
        </h1>
        <p className="text-lg" style={{ color: colors.textLight }}>
          Manage user verification requests and documents
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ backgroundColor: colors.light }}>
              <tr>
                <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User Info
                  </div>
                </th>
                <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </th>
                <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Status
                  </div>
                </th>
                <th className="py-4 px-6 text-center font-semibold" style={{ color: colors.text }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const status = user.verificationData?.status || "pending";
                return (
                  <tr
                    key={user._id}
                    className={`border-t hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                    style={{ borderColor: colors.light }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: colors.light }}>
                          {user.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.light }}>
                              <User className="w-5 h-5" style={{ color: colors.textLight }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: colors.text }}>
                            {user.name || "N/A"}
                          </p>
                          <p className="text-sm" style={{ color: colors.textLight }}>
                            {user.userType || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6" style={{ color: colors.text }}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: colors.textLight }} />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {editingUserId === user._id ? (
                        <div className="space-y-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="border px-3 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-opacity-50"
                            style={{ 
                              borderColor: colors.textLight, 
                              color: colors.text,
                              focusRingColor: colors.primary 
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <input
                            onChange={(e) => setAdminRemarks(e.target.value)}
                            className="border px-3 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-opacity-50"
                            style={{ 
                              borderColor: colors.textLight, 
                              color: colors.text,
                              focusRingColor: colors.primary 
                            }}
                            type="text"
                            placeholder="Admin remarks..."
                            name="adminRemarks"
                            id="adminRemarks"
                          />
                        </div>
                      ) : (
                        getStatusBadge(status)
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                          style={{ backgroundColor: colors.success }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>

                        {editingUserId === user._id ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(user._id)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                              style={{ backgroundColor: colors.primary }}
                              title="Save Changes"
                            >
                              <Save className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                              style={{ backgroundColor: colors.textLight }}
                              title="Cancel"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStatus(user._id, status)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                              style={{ backgroundColor: colors.warning }}
                              title="Edit Status"
                            >
                              <Edit className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                              style={{ backgroundColor: colors.danger }}
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: colors.light }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
                  User Verification Details
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  style={{ color: colors.textLight }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* User Profile Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 mb-4" style={{ borderColor: colors.primary }}>
                        {selectedUser.photo ? (
                          <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.light }}>
                            <User className="w-12 h-12" style={{ color: colors.textLight }} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
                        {selectedUser.name}
                      </h3>
                      {getStatusBadge(selectedUser.verificationData?.status)}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Basic Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                        <User className="w-5 h-5" />
                        Basic Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Email</p>
                            <p className="font-medium" style={{ color: colors.text }}>{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Phone</p>
                            <p className="font-medium" style={{ color: colors.text }}>{selectedUser.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>User Type</p>
                            <p className="font-medium capitalize" style={{ color: colors.text }}>{selectedUser.userType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Subscription</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {selectedUser.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification Data */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                        <FileText className="w-5 h-5" />
                        Verification Data
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Verification Name</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {selectedUser.verificationData?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Verification Phone</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {selectedUser.verificationData?.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>License Number</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {selectedUser.verificationData?.licenseNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>NID Number</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {selectedUser.verificationData?.nid || 'N/A'}
                            </p>
                          </div>
                        </div>
                        {selectedUser.verificationData?.vehicleReg && (
                          <div className="flex items-center gap-3">
                            <Car className="w-4 h-4" style={{ color: colors.textLight }} />
                            <div>
                              <p className="text-sm" style={{ color: colors.textLight }}>Vehicle Registration</p>
                              <p className="font-medium" style={{ color: colors.text }}>
                                {selectedUser.verificationData.vehicleReg}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                        <Calendar className="w-5 h-5" />
                        Timestamps
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Account Created</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {formatDate(selectedUser.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4" style={{ color: colors.textLight }} />
                          <div>
                            <p className="text-sm" style={{ color: colors.textLight }}>Verification Submitted</p>
                            <p className="font-medium" style={{ color: colors.text }}>
                              {formatDate(selectedUser.verificationData?.submittedAt)}
                            </p>
                          </div>
                        </div>
                        {selectedUser.verificationData?.verifiedAt && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4" style={{ color: colors.textLight }} />
                            <div>
                              <p className="text-sm" style={{ color: colors.textLight }}>Verified At</p>
                              <p className="font-medium" style={{ color: colors.text }}>
                                {formatDate(selectedUser.verificationData.verifiedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {selectedUser.verificationData?.additionalNotes && (
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                          <MessageSquare className="w-5 h-5" />
                          Additional Notes
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p style={{ color: colors.text }}>{selectedUser.verificationData.additionalNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Admin Remarks */}
                    {selectedUser.verificationData?.adminRemarks && (
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.warning }}>
                          <MessageSquare className="w-5 h-5" />
                          Admin Remarks
                        </h4>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <p style={{ color: colors.text }}>{selectedUser.verificationData.adminRemarks}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Images */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                      <Image className="w-5 h-5" />
                      Document Images
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedUser.verificationData?.licenseImage && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <h5 className="font-medium mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                            <CreditCard className="w-4 h-4" />
                            License Image
                          </h5>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={selectedUser.verificationData.licenseImage} 
                              alt="License" 
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(selectedUser.verificationData.licenseImage, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.verificationData?.nidPhoto && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <h5 className="font-medium mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                            <Hash className="w-4 h-4" />
                            NID Photo
                          </h5>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={selectedUser.verificationData.nidPhoto} 
                              alt="NID" 
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(selectedUser.verificationData.nidPhoto, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.verificationData?.vehicleRegImage && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <h5 className="font-medium mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                            <Car className="w-4 h-4" />
                            Vehicle Registration
                          </h5>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={selectedUser.verificationData.vehicleRegImage} 
                              alt="Vehicle Registration" 
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(selectedUser.verificationData.vehicleRegImage, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequest;