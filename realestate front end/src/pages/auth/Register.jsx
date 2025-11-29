import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import Icon from "../../components/AppIcon";

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const url = import.meta.env.VITE_API;

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = (pwd) => {
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
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      await axios.post(`${url}/auth/register`, payload);

      navigate("/login");
    } catch (err) {
      console.error(err?.message);

      const message =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
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
            <Icon name="Home" size={36} className="text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary">
            Sign up to start listing and exploring properties
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Enter a valid name" },
              })}
              className="w-full px-4 py-3 transition duration-150 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your full name"
              aria-invalid={errors.name ? "true" : "false"}
              onChange={() => setApiError("")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

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

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Password
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
              />
              <span
                className="absolute inset-y-0 flex items-center cursor-pointer right-3 text-text-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </span>
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
              Confirm password
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
              />
              <span
                className="absolute inset-y-0 flex items-center cursor-pointer right-3 text-text-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* API error */}
          {apiError && <div className="text-sm text-red-600">{apiError}</div>}

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
                Creating account...
              </>
            ) : (
              <>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Create account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-medium underline text-primary">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
