import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import Icon from "../../components/AppIcon";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setApiError("");
    try {
      // replace with your auth endpoint
      const res = await axios.post("/api/auth/login", {
        email: data.email,
        password: data.password,
        remember: data.remember || false,
      });

      // example: save token and redirect
      if (res?.data?.token) {
        // choose where to store token: httpOnly cookie from server is preferred
        localStorage.setItem("token", res.data.token);
      }

      // redirect to homepage or dashboard
      navigate("/homepage");
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "Login failed. Please try again.";
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
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to continue to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  message: "Enter a valid email address",
                },
              })}
              className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 bg-white`}
              placeholder="you@company.com"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

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
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 bg-white`}
                placeholder="Enter your password"
                aria-invalid={errors.password ? "true" : "false"}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute p-1 text-sm -translate-y-1/2 rounded right-2 top-1/2 text-text-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Icon name="EyeOff" size={18} />
                ) : (
                  <Icon name="Eye" size={18} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("remember")}
                className="w-4 h-4 border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-text-secondary">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm underline text-primary"
            >
              Forgot password?
            </Link>
          </div>

          {apiError && <div className="text-sm text-red-600">{apiError}</div>}

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
                Signing in...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={18} className="mr-2" />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-text-secondary">
          Don\'t have an account?{" "}
          <Link to="/signup" className="font-medium underline text-primary">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
