import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import Icon from "components/AppIcon";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const url = import.meta.env.VITE_API;

  // NEW: show/hide state for both fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password", "");

  const passwordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "Weak" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    const labels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
    return { score, label: labels[score] || "Weak" };
  };

  const onSubmit = async (data) => {
    setApiError("");
    setSuccessMessage("");
    try {
      const res = await axios.post(`${url}/auth/reset-password`, {
        token,
        password: data.password,
      });

      setSuccessMessage(
        res?.data?.message ||
          "Password reset successful! Redirecting to login..."
      );

      // Redirect after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to reset password. Try again.";
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
            Reset Password
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your new password below to update your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="w-full px-4 py-3 transition duration-150 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Create a strong password"
                aria-invalid={errors.password ? "true" : "false"}
                onChange={() => setApiError("")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 flex items-center px-1 right-3 text-text-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
              <div>Strength: {passwordStrength(password).label}</div>
              <div className="w-24 h-2 ml-3 overflow-hidden bg-gray-200 rounded">
                <div
                  style={{
                    width: `${(passwordStrength(password).score / 4) * 100}%`,
                  }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) =>
                    val === password || "Passwords do not match",
                })}
                className="w-full px-4 py-3 transition duration-150 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Repeat your password"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                onChange={() => setApiError("")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute inset-y-0 flex items-center px-1 right-3 text-text-secondary"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* API Error / Success */}
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
                Resetting...
              </>
            ) : (
              <>
                <Icon name="Key" size={18} className="mr-2" />
                Reset Password
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

export default ResetPassword;
