import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCar,
  FaSearch,
  FaCreditCard,
  FaClipboardList,
  FaStar,
  FaHome,
  FaSignOutAlt,
  FaCalendarAlt,
  FaTools,
  FaUsersCog,
  FaMoneyBillWave,
  FaCog,
} from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Menu, X } from "lucide-react";
import useAdmin from "../hooks/useAdmin";
import useOwner from "../hooks/useOwner";
import useRenter from "../hooks/useRenter";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const { user, logOut } = useAuth();
  const [isAdmin] = useAdmin();
  const [isOwner] = useOwner();
  const [isRenter] = useRenter();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  console.log(user, isAdmin, isOwner, isRenter);

  // Admin Dashboard Links
  const adminLinks = [
    {
      name: "Admin Profile",
      path: "/dashboard/profile",
      icon: <FaUser className="h-5 w-5" />,
    },
    {
      name: "User Management",
      path: "/dashboard/all-users",
      icon: <FaUsersCog className="h-5 w-5" />,
    },
    {
      name: "Car Management",
      path: "/dashboard/manage-cars",
      icon: <FaCar className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      path: "/dashboard/transactions",
      icon: <FaMoneyBillWave className="h-5 w-5" />,
    },
    {
      name: "System Settings",
      path: "/dashboard/settings",
      icon: <FaCog className="h-5 w-5" />,
    },
    {
      name: "Verification Requests",
      path: "/dashboard/verification-requests",
      icon: <IoMdCheckmarkCircleOutline className="h-5 w-5" />,
    },
  ];

  // Car Owner Dashboard Links
  const ownerLinks = [
    {
      name: "My Profile",
      path: "/dashboard/profile",
      icon: <FaUser className="h-5 w-5" />,
    },
    {
      name: "My Cars",
      path: "/dashboard/my-cars",
      icon: <FaCar className="h-5 w-5" />,
    },
    {
      name: "Add Car",
      path: "/dashboard/add-car",
      icon: <FaTools className="h-5 w-5" />,
    },
    {
      name: "Booking Requests",
      path: "/dashboard/booking-requests",
      icon: <FaClipboardList className="h-5 w-5" />,
    },
    {
      name: "Earnings",
      path: "/dashboard/earnings",
      icon: <FaMoneyBillWave className="h-5 w-5" />,
    },
  ];

  // Renter Dashboard Links
  const renterLinks = [
    {
      name: "My Profile",
      path: "/dashboard/profile",
      icon: <FaUser className="h-5 w-5" />,
    },
    {
      name: "Browse Cars",
      path: "/dashboard/browse-cars",
      icon: <FaSearch className="h-5 w-5" />,
    },
    {
      name: "My Bookings",
      path: "/dashboard/my-bookings",
      icon: <FaCalendarAlt className="h-5 w-5" />,
    },
    {
      name: "Payment Methods",
      path: "/dashboard/payment-methods",
      icon: <FaCreditCard className="h-5 w-5" />,
    },
    {
      name: "My Reviews",
      path: "/dashboard/my-reviews",
      icon: <FaStar className="h-5 w-5" />,
    },
  ];

  // Determine which links to show based on role
  const roleLinks = isAdmin ? adminLinks : isOwner ? ownerLinks : renterLinks;
  const linksToShow = [...roleLinks];

  const handleLogOut = () => {
    logOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md"
        style={{ backgroundColor: "#0d786d" }}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 w-64 h-full shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-200 ease-in-out`}
        style={{ backgroundColor: "#0d786d" }}
      >
        <div className="flex flex-col h-full p-4">
          {/* User Profile Section */}
          <div className="flex flex-col items-center mt-6 mb-8">
            <img
              className="object-cover w-24 h-24 rounded-full border-4 border-white/20"
              src={user?.photoURL || "https://via.placeholder.com/96"}
              alt="user avatar"
            />
            <h4 className="mt-4 font-medium text-white text-center">
              {user?.displayName || "User"}
              {isAdmin && " (Admin)"}
              {isOwner && " (Owner)"}
              {isRenter && " (Renter)"}
            </h4>
            <p className="mt-1 text-sm text-white/80 text-center">
              {user?.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {linksToShow.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`
                    }
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span className="font-medium">{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Links */}
          <div className="mt-auto space-y-2">
            <NavLink
              to="/"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
            >
              <FaHome className="h-5 w-5 mr-3" />
              <span className="font-medium">Home</span>
            </NavLink>
            <button
              onClick={handleLogOut}
              className="w-full flex items-center px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
            >
              <FaSignOutAlt className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
