import React from "react";
import { X, CheckCircle, Car, Truck, Clock } from "lucide-react";

const statusConfig = {
  pending_acceptance: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    text: "Pending Approval",
    icon: <Clock className="h-4 w-4" />,
  },
  payment_pending: {
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    text: "Payment Pending",
    icon: <Clock className="h-4 w-4" />,
  },
  advance_paid: {
    color: "bg-teal-100 text-teal-800 border border-teal-300",
    text: "Advance Paid",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  ready_for_pickup: {
    color: "bg-teal-200 text-teal-900 border border-teal-400",
    text: "Ready for Pickup",
    icon: <Car className="h-4 w-4" />,
  },
  picked_up: {
    color: "bg-teal-600 text-white border border-teal-700",
    text: "Picked Up",
    icon: <Truck className="h-4 w-4" />,
  },
  picked_and_payment_done: {
    color: "bg-teal-700 text-white border border-teal-800",
    text: "Picked & Payment Done",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  delivered_to_owner: {
    color: "bg-emerald-600 text-white border border-emerald-700",
    text: "Delivered to Owner",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  completed: {
    color: "bg-emerald-700 text-white border border-emerald-800",
    text: "Completed",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  reviewed: {
    color: "bg-emerald-800 text-white border border-emerald-900",
    text: "Reviewed",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border border-red-300",
    text: "Cancelled",
    icon: <X className="h-4 w-4" />,
  },
  default: {
    color: "bg-gray-100 text-gray-800 border border-gray-300",
    text: "",
    icon: null,
  },
};

function getStatusBadge(status) {
  const config = statusConfig[status] || statusConfig.default;
  return (
    <div className="flex items-center">
      {config.icon}
      <span
        className={`ml-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.text || status}
      </span>
    </div>
  );
}

function RenterBookingDetailsModal({
  visible,
  onClose,
  carDetails,
  partyDetails,
  currentBooking,
  onMakePayment,
  onMarkDelivered,
  onMarkPickedUp,
  onOpenReview,
  paymentLoading,
  actionLoading,
}) {
  if (!visible || !currentBooking || !carDetails || !partyDetails) return null;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <style jsx>{`
        .primary-bg {
          background-color: #0d786d;
        }
        .secondary-bg {
          background-color: #10a599;
        }
        .accent-bg {
          background-color: #076158;
        }
        .light-bg {
          background-color: #edf7f6;
        }
        .dark-bg {
          background-color: #065048;
        }
        .text-primary {
          color: #0d786d;
        }
        .text-secondary {
          color: #10a599;
        }
        .text-accent {
          color: #076158;
        }
        .text-dark {
          color: #065048;
        }
        .text-custom {
          color: #334155;
        }
        .text-light-custom {
          color: #64748b;
        }
        .border-primary {
          border-color: #0d786d;
        }
        .border-secondary {
          border-color: #10a599;
        }
        .border-light {
          border-color: #edf7f6;
        }
        .hover-primary:hover {
          background-color: #065048;
        }
        .hover-secondary:hover {
          background-color: #0d786d;
        }
        .focus-primary:focus {
          border-color: #0d786d;
          box-shadow: 0 0 0 3px rgba(13, 120, 109, 0.1);
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="primary-bg text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Booking Details</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-black hover:bg-opacity-20 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Car Information */}
            <div className="light-bg rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                <Car className="h-6 w-6 mr-2" />
                Car Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Make
                  </span>
                  <span className="text-custom text-lg">
                    {carDetails.car_details?.car_make || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Model
                  </span>
                  <span className="text-custom text-lg">
                    {carDetails.car_details?.car_model || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Year
                  </span>
                  <span className="text-custom text-lg">
                    {carDetails.car_details?.year || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Color
                  </span>
                  <span className="text-custom text-lg">
                    {carDetails.car_details?.car_color || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Daily Rate
                  </span>
                  <span className="text-custom text-lg font-bold">
                    ${carDetails.rental_details?.rental_price_per_day || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Pickup Location
                  </span>
                  <span className="text-custom text-lg">
                    {carDetails.rental_details?.pickup_location || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white rounded-xl p-6 border-2 border-primary shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-6">
                Owner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="light-bg p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Name
                  </span>
                  <span className="text-custom text-lg">
                    {partyDetails.name}
                  </span>
                </div>
                <div className="light-bg p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Email
                  </span>
                  <span className="text-custom text-lg">
                    {partyDetails.email}
                  </span>
                </div>
                <div className="light-bg p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Phone
                  </span>
                  <span className="text-custom text-lg">
                    {partyDetails.phone}
                  </span>
                </div>
                <div className="light-bg p-4 rounded-lg border border-gray-100 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Verification Status
                  </span>
                  <span className="text-custom text-lg capitalize">
                    {partyDetails.verificationStatus?.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-secondary shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Booking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Booking ID
                  </span>
                  <span className="text-custom text-sm font-mono">
                    {currentBooking._id}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Booking Date
                  </span>
                  <span className="text-custom text-lg">
                    {formatDate(currentBooking.createdAt)}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Start Date
                  </span>
                  <span className="text-custom text-lg">
                    {formatDate(currentBooking.startDate)}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    End Date
                  </span>
                  <span className="text-custom text-lg">
                    {formatDate(currentBooking.endDate)}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Total Days
                  </span>
                  <span className="text-custom text-lg font-bold">
                    {currentBooking.totalDays}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-primary block mb-1">
                    Daily Rate
                  </span>
                  <span className="text-custom text-lg font-bold">
                    ${currentBooking.dailyRate}
                  </span>
                </div>
                <div className="secondary-bg p-4 rounded-lg border-2 border-primary shadow-sm">
                  <span className="font-semibold text-white block mb-1">
                    Total Cost
                  </span>
                  <span className="text-white text-xl font-bold">
                    ${currentBooking.estimatedTotal}
                  </span>
                </div>
                <div className="secondary-bg p-4 rounded-lg border-2 border-primary shadow-sm">
                  <span className="font-semibold text-white block mb-1">
                    Advance Amount
                  </span>
                  <span className="text-white text-xl font-bold">
                    ${currentBooking.advanceAmount}
                  </span>
                </div>
                <div className="secondary-bg p-4 rounded-lg border-2 border-primary shadow-sm">
                  <span className="font-semibold text-white block mb-1">
                    Remaining Amount
                  </span>
                  <span className="text-white text-xl font-bold">
                    $
                    {currentBooking.estimatedTotal -
                      currentBooking.advanceAmount}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                  <span className="font-semibold text-primary block mb-2">
                    Status
                  </span>
                  {getStatusBadge(currentBooking.status)}
                </div>
                {currentBooking.pickupDetails && (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <span className="font-semibold text-primary block mb-1">
                        Pickup Time
                      </span>
                      <span className="text-custom text-lg">
                        {new Date(
                          currentBooking.pickupDetails.pickupTime
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-2">
                      <span className="font-semibold text-primary block mb-1">
                        Pickup Instructions
                      </span>
                      <span className="text-custom text-lg">
                        {currentBooking.pickupDetails.pickupInstructions}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {currentBooking.status === "payment_pending" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-center">
                  <button
                    onClick={onMakePayment}
                    disabled={paymentLoading}
                    className={`px-8 py-3 rounded-xl primary-bg text-white font-bold text-lg hover-primary transform hover:scale-105 transition-all duration-200 shadow-lg ${
                      paymentLoading
                        ? "opacity-50 cursor-not-allowed transform-none"
                        : ""
                    }`}
                  >
                    {paymentLoading ? "Processing..." : "Pay Advance"}
                  </button>
                </div>
              </div>
            )}
            {currentBooking.status === "ready_for_pickup" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-center">
                  <button
                    onClick={onMarkPickedUp}
                    disabled={actionLoading}
                    className={`px-8 py-3 rounded-xl primary-bg text-white font-bold text-lg hover-primary transform hover:scale-105 transition-all duration-200 shadow-lg ${
                      actionLoading
                        ? "opacity-50 cursor-not-allowed transform-none"
                        : ""
                    }`}
                  >
                    {actionLoading ? "Processing..." : "Mark as Picked Up"}
                  </button>
                </div>
              </div>
            )}
            {currentBooking.status === "picked_and_payment_done" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-center">
                  <button
                    onClick={onMarkDelivered}
                    disabled={actionLoading}
                    className={`px-8 py-3 rounded-xl primary-bg text-white font-bold text-lg hover-primary transform hover:scale-105 transition-all duration-200 shadow-lg ${
                      actionLoading
                        ? "opacity-50 cursor-not-allowed transform-none"
                        : ""
                    }`}
                  >
                    {actionLoading ? "Processing..." : "Mark as Delivered"}
                  </button>
                </div>
              </div>
            )}
            {currentBooking.status === "completed" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReview();
                    }}
                    disabled={actionLoading}
                    className={`px-8 py-3 rounded-xl primary-bg text-white font-bold text-lg hover-primary transform hover:scale-105 transition-all duration-200 shadow-lg ${
                      actionLoading
                        ? "opacity-50 cursor-not-allowed transform-none"
                        : ""
                    }`}
                  >
                    Leave a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RenterBookingDetailsModal;