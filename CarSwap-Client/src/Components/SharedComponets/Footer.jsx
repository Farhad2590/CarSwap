// import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-teal-400" />
              <span className="text-2xl font-bold">CarSwap</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connect with car owners and renters in your area. Experience hassle-free car sharing
              with our trusted community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-teal-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Subscription Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Safety Information
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-teal-400" />
                <span className="text-gray-400">123 Car Street, Auto City, AC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-teal-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-teal-400" />
                <span className="text-gray-400">support@carswap.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CarSwap. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;