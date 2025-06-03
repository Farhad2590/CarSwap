import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

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

const PaymentResult = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("payment");
    
    if (!status) {
      console.error("No payment status found in URL");
      const fallbackParams = new URLSearchParams(window.location.search);
      const fallbackStatus = fallbackParams.get("payment");
      setPaymentStatus(fallbackStatus || 'unknown');
    } else {
      setPaymentStatus(status);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard/my-bookings');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.search, navigate]);

  const handleRedirect = () => {
    navigate('/dashboard/my-bookings');
  };

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16" />,
          color: colors.success,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully. Your booking has been confirmed and you will receive a confirmation email shortly.',
          buttonText: 'View My Bookings',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-16 w-16" />,
          color: colors.danger,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please check your payment details and try again, or contact support if the issue persists.',
          buttonText: 'Try Again',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'cancelled':
        return {
          icon: <AlertCircle className="h-16 w-16" />,
          color: colors.warning,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Cancelled',
          message: 'You have cancelled the payment process. Your booking is still pending - you can complete the payment anytime from your bookings page.',
          buttonText: 'Back to Bookings',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16" />,
          color: colors.textLight,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Payment Status Unknown',
          message: 'Unable to determine payment status. Please check your bookings page for the latest status.',
          buttonText: 'View Bookings',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.light }}>
      <div className="max-w-lg w-full">
        {/* Main Status Card */}
        <div className={`${statusConfig.bgColor} rounded-2xl shadow-xl p-8 text-center border-2 ${statusConfig.borderColor}`}>
          <div className="flex justify-center mb-6">
            <div 
              className="rounded-full p-4"
              style={{ backgroundColor: statusConfig.color + '20' }}
            >
              <div style={{ color: statusConfig.color }}>
                {statusConfig.icon}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
            {statusConfig.title}
          </h1>

          <p className="text-lg mb-8 leading-relaxed" style={{ color: colors.textLight }}>
            {statusConfig.message}
          </p>

          <div className="space-y-4">
            <button
              onClick={handleRedirect}
              className={`w-full ${statusConfig.buttonColor} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105 active:scale-95`}
            >
              <ArrowLeft className="h-5 w-5" />
              {statusConfig.buttonText}
            </button>

            <div className="flex items-center justify-center gap-2 text-base" style={{ color: colors.textLight }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></div>
              Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border-2" style={{ borderColor: colors.primary + '20' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <AlertCircle className="h-5 w-5" style={{ color: colors.primary }} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2" style={{ color: colors.text }}>
                Need Help?
              </h3>
              <p className="text-base mb-3" style={{ color: colors.textLight }}>
                If you're experiencing issues with your payment or booking, our support team is here to help.
              </p>
              <button
                className="text-base font-medium underline hover:no-underline transition-all duration-200 hover:scale-105"
                style={{ color: colors.primary }}
                onClick={() => {
                  alert('Contact support at: support@carrental.com or call +880-XXX-XXXXX');
                }}
              >
                Contact Support →
              </button>
            </div>
          </div>
        </div>

        {/* Payment Status Indicator */}
        {paymentStatus && (
          <div className="mt-4 text-center">
            <span className="text-sm font-mono px-3 py-1 rounded-full" style={{ 
              backgroundColor: colors.primary + '10',
              color: colors.primary 
            }}>
              Status: {paymentStatus.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;