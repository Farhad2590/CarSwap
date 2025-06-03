import { useState } from "react";
import Signup from "../Pages/Signup";
import { Car, Repeat, X } from "lucide-react";
import { Link } from "react-router-dom";

const SignUpFlow = () => {
  const [showModal, setShowModal] = useState(true);
  const [userType, setUserType] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handlePathSelection = (type) => {
    setUserType(type);
    setShowModal(false);
  };

  return (
    <>
      {!showModal && userType ? (
        <Signup userType={userType} />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-100 rounded-full opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-100 rounded-full opacity-20"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                  Join CarSwap
                </h2>
                <p className="text-gray-600 mt-2">
                  Are you a car owner or looking to rent a car?
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <button
                onClick={() => handlePathSelection("owner")}
                onMouseEnter={() => setHoveredCard("owner")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-8 border-2 rounded-2xl transition-all duration-300 group
                  ${
                    hoveredCard === "owner" || hoveredCard === null
                      ? "border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-lg"
                      : "border-gray-100 opacity-80"
                  }
                  hover:shadow-xl hover:scale-[1.02]`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-24 h-24 mb-6 flex items-center justify-center rounded-2xl transition-all
                    ${
                      hoveredCard === "owner"
                        ? "bg-teal-500 text-white"
                        : "bg-teal-100 text-teal-500"
                    }`}
                  >
                    <Car className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-teal-600">
                    I am a Car Owner
                  </h3>
                  <p className="text-gray-500 text-center text-sm max-w-[200px]">
                    List my car for renting on the platform
                  </p>
                  {/* <div className="flex items-center mt-2 text-sm text-teal-500">
                    <BadgeCheck className="w-4 h-4 mr-1" />
                    <span>Verification available</span>
                  </div> */}
                </div>
              </button>

              <button
                onClick={() => handlePathSelection("renter")}
                onMouseEnter={() => setHoveredCard("renter")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-8 border-2 rounded-2xl transition-all duration-300 group
                  ${
                    hoveredCard === "renter" || hoveredCard === null
                      ? "border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-lg"
                      : "border-gray-100 opacity-80"
                  }
                  hover:shadow-xl hover:scale-[1.02]`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-24 h-24 mb-6 flex items-center justify-center rounded-2xl transition-all
                    ${
                      hoveredCard === "renter"
                        ? "bg-teal-500 text-white"
                        : "bg-teal-100 text-teal-500"
                    }`}
                  >
                    <Repeat className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-teal-600">
                    I want to Rent
                  </h3>
                  <p className="text-gray-500 text-center text-sm max-w-[200px]">
                    Find and rent cars from local owners
                  </p>
                  {/* <div className="flex items-center mt-2 text-sm text-teal-500">
                    <BadgeCheck className="w-4 h-4 mr-1" />
                    <span>Verification available</span>
                  </div> */}
                </div>
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 relative z-10">
              Already have an account?{" "}
              <Link
                to="/signin"
                onClick={() => setShowModal(false)}
                className="text-teal-500 hover:text-teal-700 font-medium"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUpFlow;