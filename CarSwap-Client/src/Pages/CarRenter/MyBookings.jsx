import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Clock, CheckCircle, Car, Truck, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import BookingDetailsModal from "../Shared/BookingDetailsModal";

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

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();
  // const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:9000/booking/user/email/${user?.email}`
      );
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.email) {
      fetchBookings();

      // Check for payment result in URL params
      const queryParams = new URLSearchParams(window.location.search);
      const paymentStatus = queryParams.get("payment");
      const bookingId = queryParams.get("booking_id");
      const error = queryParams.get("error");
      const tranId = queryParams.get("tran_id");

      if (paymentStatus && bookingId) {
        // Remove query params from URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        if (paymentStatus === "success") {
          console.log(
            `Payment successful - Transaction ID: ${tranId}, Booking ID: ${bookingId}`
          );
          toast.success("Payment completed successfully!");
          fetchBookings();
        } else {
          console.error(
            `Payment failed - Booking ID: ${bookingId}, Error: ${
              error || "Unknown error"
            }, Transaction ID: ${tranId || "N/A"}`
          );
          toast.error(`Payment failed: ${error || "Unknown error"}`);
        }
      }
    }
  }, [user?.email]);

  const handleMakePayment = async () => {
    if (!currentBooking) return;

    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:9000/booking/${currentBooking._id}/payment`,
        {
          amount: currentBooking.advanceAmount,
          email: user?.email,
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        // Open payment URL in a new tab
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to initiate payment. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleViewDetails = async (booking) => {
    setCurrentBooking(booking);
    try {
      const carResponse = await axios.get(
        `http://localhost:9000/cars/${booking.carId}`
      );
      setCarDetails(carResponse.data);

      const ownerResponse = await axios.get(
        `http://localhost:9000/users/${booking.ownerEmail}`
      );
      setOwnerDetails(ownerResponse.data);

      setModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch details:", error);
      toast.error("Failed to load booking details");
    }
  };

  // const handleMakePayment = async () => {
  //   setPaymentLoading(true);
  //   try {
  //     const response = await axios.post(
  //       `http://localhost:9000/booking/${currentBooking._id}/payment`,
  //       {
  //         amount: currentBooking.advanceAmount,
  //         email: user?.email,
  //       }
  //     );

  //     if (response.data.success && response.data.paymentUrl) {
  //       // Open payment URL in the same window
  //       window.location.href = response.data.paymentUrl;
  //     } else {
  //       throw new Error("Payment URL not received");
  //     }
  //   } catch (error) {
  //     console.error("Failed to initiate payment:", error);
  //     toast.error(
  //       error.response?.data?.error ||
  //         "Failed to initiate payment. Please try again."
  //     );
  //   } finally {
  //     setPaymentLoading(false);
  //   }
  // };

  const handleMarkPickedUp = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:9000/booking/${currentBooking._id}/picked-up`
      );
      setBookings(
        bookings.map((booking) =>
          booking._id === currentBooking._id
            ? { ...booking, status: "picked_up" }
            : booking
        )
      );
      setCurrentBooking({
        ...currentBooking,
        status: "picked_up",
      });
      toast.success("Marked as picked up!");
    } catch (error) {
      toast.error("Failed to mark as picked up");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:9000/booking/${currentBooking._id}/delivered`
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
        My Bookings
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
              No bookings found
            </p>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              Your booking history will appear here
            </p>
          </div>
        )}
      </div>

      <BookingDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        carDetails={carDetails}
        partyDetails={ownerDetails}
        currentBooking={currentBooking}
        userRole="renter"
        onMakePayment={handleMakePayment}
        onMarkPickedUp={handleMarkPickedUp}
        onMarkDelivered={handleMarkDelivered}
        paymentLoading={paymentLoading}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default MyBookings;
