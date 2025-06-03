import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Info = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const verificationStatus = urlParams.get("verification");

  useEffect(() => {
    if (verificationStatus) {
      navigate(window.location.pathname, { replace: true });
    }
  }, [verificationStatus, navigate]);

  if (verificationStatus) {
    const statusConfig = {
      success: {
        title: "Payment Successful!",
        message:
          "Your verification request has been submitted and is pending admin approval. You will be notified once your account is verified.",
        icon: (
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
        ),
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        buttonText: "Back to Profile",
        buttonLink: "/profile",
      },
      failed: {
        title: "Payment Failed",
        message: "Your payment could not be processed. Please try again.",
        icon: <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />,
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        buttonText: "Try Again",
        buttonLink: "/dashboard/verification",
      },
      cancelled: {
        title: "Payment Cancelled",
        message: "You have cancelled the payment process.",
        icon: (
          <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
        ),
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        buttonText: "Try Again",
        buttonLink: "/dashboard/verification",
      },
    };

    const config = statusConfig[verificationStatus];

    if (config) {
      return (
        <div className="max-w-md mx-auto p-6 mt-10">
          <div
            className={`${config.bgColor} rounded-xl shadow-md overflow-hidden p-6 text-center`}
          >
            {config.icon}
            <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
            <p className="text-gray-600 mb-6">{config.message}</p>
            <Link
              to={config.buttonLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
            >
              {config.buttonText}
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Verification Status
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        You will be redirected here after completing the verification process.
      </p>
    </div>
  );
};

export default Info;
