import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentResult = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const payment = urlParams.get("payment");
  const tranId = urlParams.get("tran_id");
  const amount = urlParams.get("amount");
  const bookingId = urlParams.get("booking_id");
  const error = urlParams.get("error");

  useEffect(() => {
    // Auto redirect to bookings after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard/my-bookings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const getResultConfig = () => {
    switch (payment) {
      case "success":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Payment Successful!",
          message: "Your advance payment has been processed successfully.",
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
            : "Your payment could not be processed. Please try again.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      case "cancelled":
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
          title: "Payment Cancelled",
          message: "You cancelled the payment process.",
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div
          className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-8 text-center shadow-lg`}
        >
          <div className="flex justify-center mb-4">{config.icon}</div>

          <h1 className="text-2xl font-bold mb-4">{config.title}</h1>
          <p className="text-sm mb-6">{config.message}</p>

          {(tranId || amount || bookingId) && (
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
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard/my-bookings")}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to My Bookings
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
