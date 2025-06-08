import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentResult = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const payment = urlParams.get("payment");
  const tranId = urlParams.get("tran_id");
  const amount = urlParams.get("amount");
  const bookingId = urlParams.get("booking_id");
  const email = urlParams.get("email");
  const error = urlParams.get("error");

  if (!payment) {
    console.warn("Missing payment status parameter in URL", {
      payment,
      tranId,
      amount,
      bookingId,
      email,
      error,
    });
  }

  useEffect(() => {
    // Update admin balance if payment is successful
    // const updateAdminBalance = async () => {
    //   if (payment === "success" && amount) {
    //     try {
    //       await axios.post("http://localhost:9000/users/update-admin-balance", {
    //         amount: parseFloat(amount),
    //         transactionId: tranId,
    //         userEmail: email,
    //       });
    //       console.log("Admin balance updated successfully");
    //     } catch (err) {
    //       console.error("Failed to update admin balance:", err);
    //     }
    //   }
    // };

    // updateAdminBalance();

    // Auto redirect to appropriate page after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (email) {
            navigate("/dashboard/profile");
          } else {
            navigate("/dashboard/my-bookings");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, payment, amount, tranId, email]);

  const getResultConfig = () => {
    switch (payment) {
      case "success":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Payment Successful!",
          message: email
            ? "Your verification payment has been processed successfully."
            : "Your advance payment has been processed successfully.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
        };
      case "failed":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Payment Failed",
          message: error
            ? `Error: ${decodeURIComponent(error)}`
            : email
            ? "Your verification payment could not be processed. Please try again."
            : "Your payment could not be processed. Please try again.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      case "cancelled":
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
          title: "Payment Cancelled",
          message: email
            ? "You cancelled the verification payment process."
            : "You cancelled the payment process.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-gray-500" />,
          title: "Unknown Status",
          message: "Unable to determine payment status.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
        };
    }
  };

  const config = getResultConfig();

  const redirectPath = email ? "/dashboard/profile" : "/dashboard/my-bookings";
  const redirectText = email ? "Go to Profile" : "Go to My Bookings";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div
          className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-8 text-center shadow-lg`}
        >
          <div className="flex justify-center mb-4">{config.icon}</div>

          <h1 className="text-2xl font-bold mb-4">{config.title}</h1>
          <p className="text-sm mb-6">{config.message}</p>

          {(tranId || amount || bookingId || email) && (
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                {tranId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction ID:</span>
                    <span className="text-gray-600 break-all">{tranId}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="text-gray-600">৳{amount}</span>
                  </div>
                )}
                {bookingId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Booking ID:</span>
                    <span className="text-gray-600 break-all">{bookingId}</span>
                  </div>
                )}
                {email && (
                  <div className="flex justify-between">
                    <span className="font-medium">User Email:</span>
                    <span className="text-gray-600 break-all">{email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate(redirectPath)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {redirectText}
            </button>

            <p className="text-xs text-gray-500">
              Redirecting automatically in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
