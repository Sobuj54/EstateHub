import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import Icon from "../../components/AppIcon";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const url = import.meta.env.VITE_API;

  const onSubmit = async (data) => {
    setApiError("");
    setSuccessMessage("");
    try {
      const res = await axios.post(`${url}/auth/forgot-password`, {
        email: data.email,
      });
      console.log(res);

      if (res?.data?.message) {
        setSuccessMessage(res.data.message);
      } else {
        setSuccessMessage("If this email exists, a reset link has been sent.");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      setApiError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-md p-8 shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl"
      >
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100">
            <Icon name="Key" size={36} className="text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Forgot Password
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full px-4 py-3 transition duration-150 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@gmail.com"
              aria-invalid={errors.email ? "true" : "false"}
              onChange={() => setApiError("")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* API Error */}
          {apiError && <div className="text-sm text-red-600">{apiError}</div>}
          {successMessage && (
            <div className="text-sm text-green-600">{successMessage}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 micro-interaction"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Icon name="Send" size={18} className="mr-2" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-text-secondary">
          Remember your password?{" "}
          <Link to="/login" className="font-medium underline text-primary">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
