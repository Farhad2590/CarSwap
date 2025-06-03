import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingConfirmation = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
          <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h1>
          <p className="text-gray-600">Thank you for choosing CarSwap. Your booking has been successfully placed.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {/* Booking Summary */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Car:</span>
                <span className="font-medium">BMW 3 Series</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span>Los Angeles</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup Date:</span>
                <span>12/05/2025</span>
              </div>
              <div className="flex justify-between">
                <span>Return Date:</span>
                <span>13/05/2025</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Period:</span>
                <span>1 day</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Price Breakdown</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span>$65</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees:</span>
                <span>$10</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total:</span>
                <span>$75</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to={"/dashboard/my-bookings"} className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-600 transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
