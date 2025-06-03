import { useState } from 'react';
import { Link } from 'react-router-dom';
// import UseAuth from '../hooks/UseAuth';
import { Menu, X, Car, User, LogOut } from 'lucide-react';
import UseAuth from '../../hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logOut } = UseAuth()

  const handleLogOut = () => {
    logOut()
      .then(() => {})
      .catch(error => console.log(error));
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-teal-500" />
              <span className="text-2xl font-bold text-gray-900">CarSwap</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-teal-500 transition-colors">
              Home
            </Link>
            <Link to="/cars" className="text-gray-700 hover:text-teal-500 transition-colors">
              Browse Cars
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-teal-500 transition-colors">
              About Us
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-teal-500">
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/signUpFlow"
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Sign Up
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-teal-500 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:text-teal-500 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/cars"
              className="block px-3 py-2 text-gray-700 hover:text-teal-500 transition-colors"
            >
              Browse Cars
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-700 hover:text-teal-500 transition-colors"
            >
              About Us
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-teal-500 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogOut}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/signUpFlow"
                className="block px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors mx-3"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;