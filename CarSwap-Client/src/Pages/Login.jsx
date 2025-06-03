import { Link, useLocation, useNavigate } from "react-router-dom";
import UseAuth from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { Car, Mail, Lock } from 'lucide-react';
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import animationData from "../assets/annimation/login.json";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state || "/";
    const { signIn } = UseAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const { email, password } = data;
        signIn(email, password)
            .then((result) => {
                const user = result.user;
                console.log(user);
                toast.success("Login Successful");
                navigate(from, { replace: true });
            })
            .catch((error) => {
                console.error("Sign-in error:", error);
                toast.error(error.message || "Error logging in. Please try again.");
            });
    };


    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
            {/* Left Side - Animation */}
            <div className="lg:w-1/2 flex items-center justify-center p-8">
                <div className="text-center w-full max-w-lg">
                    <div className="mb-8">
                        <Lottie 
                            animationData={animationData} 
                            loop={true} 
                            className="w-full"
                        />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md inline-flex items-center space-x-3">
                        <Car className="text-teal-500 w-6 h-6" />
                        <span className="font-medium text-gray-800">
                            Welcome to <span className="text-teal-500 font-bold">CarSwap</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-teal-600 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500">
                            Sign in to access your car swap dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-teal-500" />
                            </div>
                            <input
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
                                placeholder="Email address"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-teal-500" />
                            </div>
                            <input
                                type="password"
                                {...register("password", { required: "Password is required" })}
                                className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
                                placeholder="Password"
                            />
                        </div>
                        {errors.password && (
                            <div className="flex items-center text-red-500 text-sm">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.password.message}
                            </div>
                        )}

                        {/* Remember Me and Forgot Password */}
                        <div className="flex justify-between items-center mt-2">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                                <span className="ml-2">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl hover:from-teal-600 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform transition-all hover:scale-105"
                        >
                            Sign In
                        </button>
                    </form>

                    
                    {/* Sign Up Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Dont have an account?{" "}
                            <Link
                                to="/signUpFlow"
                                className="text-teal-600 hover:text-teal-800 font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;