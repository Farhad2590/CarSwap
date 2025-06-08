import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Check, X, Clock, CheckCircle, Car, Truck } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import BookingDetailsModal from "../Shared/BookingDetailsModal";
import RenterBookingDetailsModal from "../Shared/RenterBookingDetailsModal";

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

const RequestedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [renterDetails, setRenterDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupDetails, setPickupDetails] = useState({
    pickupTime: "",
    pickupInstructions: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9000/booking/user/email/${user?.email}`
        );
        setBookings(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (user?.email) fetchBookings();
  }, [user?.email]);

  const handleViewDetails = async (booking) => {
    setCurrentBooking(booking);
    try {
      const carResponse = await axios.get(
        `http://localhost:9000/cars/${booking.carId}`
      );
      setCarDetails(carResponse.data);

      const renterResponse = await axios.get(
        `http://localhost:9000/users/${booking.renterEmail}`
      );
      setRenterDetails(renterResponse.data);
      setModalVisible(true);
    } catch (error) {
      toast.error("Failed to load booking details");
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await axios.put(`http://localhost:9000/booking/${bookingId}/accept`);
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "payment_pending" }
            : booking
        )
      );
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({ ...currentBooking, status: "payment_pending" });
      }
      toast.success("Booking request accepted");
    } catch (error) {
      toast.error("Failed to accept booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await axios.put(`http://localhost:9000/booking/${bookingId}/reject`, {
        rejectionReason: "Owner rejected the booking",
      });
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({ ...currentBooking, status: "cancelled" });
      }
      toast.success("Booking request rejected");
    } catch (error) {
      toast.error("Failed to reject booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPickupDetails = async () => {
    if (!pickupDetails.pickupTime || !pickupDetails.pickupInstructions) {
      toast.error("Please fill all pickup details");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:9000/booking/${currentBooking._id}/pickup-details`,
        { pickupDetails }
      );
      setBookings(
        bookings.map((booking) =>
          booking._id === currentBooking._id
            ? { ...booking, status: "ready_for_pickup" }
            : booking
        )
      );
      setCurrentBooking({
        ...currentBooking,
        status: "ready_for_pickup",
        pickupDetails,
      });
      setPickupDetails({ pickupTime: "", pickupInstructions: "" });
      toast.success("Pickup details set successfully");
    } catch (error) {
      toast.error("Failed to set pickup details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPickedAndPaymentDone = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:9000/booking/${currentBooking._id}/picked-and-payment-done`
      );
      setBookings(
        bookings.map((booking) =>
          booking._id === currentBooking._id
            ? { ...booking, status: "picked_and_payment_done" }
            : booking
        )
      );
      setCurrentBooking({
        ...currentBooking,
        status: "picked_and_payment_done",
      });
      toast.success("Marked as Picked and Payment Done");
    } catch (error) {
      toast.error("Failed to mark picked and payment done");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:9000/booking/${currentBooking._id}/mark-delivered`
      );
      setBookings(
        bookings.map((booking) =>
          booking._id === currentBooking._id
            ? { ...booking, status: "delivered_to_owner" }
            : booking
        )
      );
      setCurrentBooking({
        ...currentBooking,
        status: "delivered_to_owner",
      });
      toast.success("Car marked as delivered to owner");
    } catch (error) {
      toast.error("Failed to mark as delivered");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:9000/booking/${currentBooking._id}/complete`
      );
      setBookings(
        bookings.map((booking) =>
          booking._id === currentBooking._id
            ? { ...booking, status: "completed" }
            : booking
        )
      );
      setCurrentBooking({
        ...currentBooking,
        status: "completed",
      });
      toast.success("Booking marked as completed");
    } catch (error) {
      toast.error("Failed to complete booking");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.default;
  };

  return (
    <div className="p-6" style={{ backgroundColor: colors.light }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text }}>
        Requested Bookings
      </h1>
      <div
        className="bg-white shadow-lg rounded-xl overflow-hidden border"
        style={{ borderColor: colors.primary + "20" }}
      >
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y"
            style={{ borderColor: colors.primary + "20" }}
          >
            <thead style={{ backgroundColor: colors.primary }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Renter Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Rental Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y"
              style={{ borderColor: colors.primary + "10" }}
            >
              {bookings.map((booking, index) => (
                <tr
                  key={booking._id}
                  className="hover:bg-opacity-50 transition-colors duration-200"
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "white" : colors.light + "30",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.closest("tr").style.backgroundColor =
                      colors.light + "60")
                  }
                  onMouseLeave={(e) =>
                    (e.target.closest("tr").style.backgroundColor =
                      index % 2 === 0 ? "white" : colors.light + "30")
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {booking.renterName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: colors.text }}>
                      {formatDate(booking.startDate)} -{" "}
                      {formatDate(booking.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm font-bold"
                      style={{ color: colors.primary }}
                    >
                      ${booking.estimatedTotal}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusConfig(booking.status).color
                      }`}
                    >
                      {getStatusConfig(booking.status).icon}
                      {getStatusConfig(booking.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                          backgroundColor: colors.secondary + "20",
                          color: colors.primary,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.secondary;
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor =
                            colors.secondary + "20";
                          e.target.style.color = colors.primary;
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {booking.status === "pending_acceptance" && (
                        <>
                          <button
                            onClick={() => handleAcceptBooking(booking._id)}
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                            style={{
                              backgroundColor: colors.success + "20",
                              color: colors.success,
                            }}
                            onMouseEnter={(e) => {
                              if (!actionLoading) {
                                e.target.style.backgroundColor = colors.success;
                                e.target.style.color = "white";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!actionLoading) {
                                e.target.style.backgroundColor =
                                  colors.success + "20";
                                e.target.style.color = colors.success;
                              }
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking._id)}
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                            style={{
                              backgroundColor: colors.danger + "20",
                              color: colors.danger,
                            }}
                            onMouseEnter={(e) => {
                              if (!actionLoading) {
                                e.target.style.backgroundColor = colors.danger;
                                e.target.style.color = "white";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!actionLoading) {
                                e.target.style.backgroundColor =
                                  colors.danger + "20";
                                e.target.style.color = colors.danger;
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.light }}
            >
              <Car className="h-8 w-8" style={{ color: colors.textLight }} />
            </div>
            <p
              className="text-lg font-medium"
              style={{ color: colors.textLight }}
            >
              No booking requests found
            </p>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              Booking requests from renters will appear here
            </p>
          </div>
        )}
      </div>
      <RenterBookingDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        carDetails={carDetails}
        partyDetails={renterDetails}
        currentBooking={currentBooking}
        // userRole="owner"
        onSetPickupDetails={handleSetPickupDetails}
        onMarkPickedAndPaymentDone={handleMarkPickedAndPaymentDone}
        onComplete={handleCompleteBooking}
        pickupDetails={pickupDetails}
        setPickupDetails={setPickupDetails}
        actionLoading={actionLoading}
        
      />
    </div>
  );
};

export default RequestedBookings;
