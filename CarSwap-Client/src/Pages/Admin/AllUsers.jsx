import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrashAlt, FaSave, FaTimes, FaUsers } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlinePending, MdWarning } from "react-icons/md";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
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
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
      toast.error("Failed to load users");
    }
  };

  const handleEditRole = (userId, currentRole) => {
    setEditingUserId(userId);
    setNewRole(currentRole);
  };

  const handleRoleUpdate = async (userId) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      await axios.put(`${api}/users/updateUserRole/${user.email}`, {
        userType: newRole,
      });

      setUsers(
        users.map((u) => (u._id === userId ? { ...u, userType: newRole } : u))
      );
      setEditingUserId(null);
      toast.success("User role updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${api}/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      toast.error("Failed to delete user");
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <IoMdCheckmarkCircleOutline size={20} style={{ color: colors.success }} />;
      case "pending":
        return <MdOutlinePending size={20} style={{ color: colors.warning }} />;
      case "rejected":
        return <MdWarning size={20} style={{ color: colors.danger }} />;
      default:
        return null;
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return {
          bg: "#805ad530",
          text: "#805ad5"
        };
      case "owner":
        return {
          bg: "#3182ce30",
          text: "#3182ce"
        };
      case "renter":
        return {
          bg: `${colors.primary}30`,
          text: colors.primary
        };
      default:
        return {
          bg: "#a0aec030",
          text: "#a0aec0"
        };
    }
  };

  const getSubscriptionStatus = (isSubscribed) => {
    return isSubscribed ? (
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: colors.success }}></div>
        <span className="text-sm font-medium" style={{ color: colors.success }}>Subscribed</span>
      </div>
    ) : (
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: colors.textLight }}></div>
        <span className="text-sm font-medium" style={{ color: colors.textLight }}>Not Subscribed</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <BiLoaderAlt className="animate-spin text-4xl mb-2" style={{ color: colors.primary }} />
          <p style={{ color: colors.textLight }}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <MdWarning className="text-4xl mb-2" style={{ color: colors.danger }} />
          <p style={{ color: colors.danger }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <FaUsers className="text-3xl mr-3" style={{ color: colors.primary }} />
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>User Management</h1>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border" style={{ borderColor: `${colors.light}` }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: colors.light }}>
            <thead>
              <tr style={{ backgroundColor: colors.light }}>
                <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: colors.primary }}>Name</th>
                <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: colors.primary }}>Email</th>
                <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: colors.primary }}>Role</th>
                {/* <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: colors.primary }}>Subscription Status</th> */}
                <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: colors.primary }}>Verification Status</th>
                <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: colors.primary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.light }}>
              {users.map((user) => {
                const roleBadgeStyle = getRoleBadgeStyle(user.userType);
                
                return (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {user.photo ? (
                          <img 
                            src={user.photo} 
                            alt={user.name} 
                            className="h-8 w-8 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center mr-3" 
                            style={{ backgroundColor: `${colors.primary}20` }}
                          >
                            <span className="text-xs font-bold" style={{ color: colors.primary }}>
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                        <span className="font-medium" style={{ color: colors.text }}>
                          {user.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6" style={{ color: colors.textLight }}>
                      {user.email}
                    </td>
                    <td className="py-4 px-6">
                      {editingUserId === user._id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 transition-all duration-200"
                          style={{ 
                            borderColor: colors.light,
                            color: colors.text,
                            focusRing: `${colors.primary}40`
                          }}
                        >
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                          <option value="renter">Renter</option>
                        </select>
                      ) : (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                          style={{ 
                            backgroundColor: roleBadgeStyle.bg,
                            color: roleBadgeStyle.text
                          }}
                        >
                          {user.userType || "user"}
                        </span>
                      )}
                    </td>
                    {/* <td className="py-4 px-6">
                      {getSubscriptionStatus(user.isSubscribed)}
                    </td> */}
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {getVerificationStatusIcon(user.verificationData?.status)}
                        <span 
                          className="ml-2 text-sm capitalize"
                          style={{ 
                            color: user.verificationData?.status === "verified" 
                              ? colors.success 
                              : user.verificationData?.status === "pending" 
                                ? colors.warning 
                                : colors.textLight 
                          }}
                        >
                          {user.verificationData?.status || "Not verified"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        {editingUserId === user._id ? (
                          <>
                            <button
                              onClick={() => handleRoleUpdate(user._id)}
                              className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: `${colors.success}20` }}
                              title="Save"
                            >
                              <FaSave size={16} style={{ color: colors.success }} />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: `${colors.danger}20` }}
                              title="Cancel"
                            >
                              <FaTimes size={16} style={{ color: colors.danger }} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditRole(user._id, user.userType)}
                              className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: `${colors.primary}20` }}
                              title="Edit Role"
                            >
                              <FaEdit size={16} style={{ color: colors.primary }} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 rounded-full transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: `${colors.danger}20` }}
                              title="Delete User"
                            >
                              <FaTrashAlt size={16} style={{ color: colors.danger }} />
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
        
        {users.length === 0 && (
          <div className="py-8 text-center" style={{ color: colors.textLight }}>
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;