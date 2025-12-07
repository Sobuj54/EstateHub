// src/pages/agent-dashboard/components/QuickListingForm.jsx
import React, { useState, useCallback } from "react";
import Icon from "../../../components/AppIcon";

import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";
import { toast } from "react-toastify";

const API_URL = "/properties/agent/create";

const useCreateListingMutation = (onSuccessCallback, onErrorCallback) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.post(API_URL, payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      // 🚀 SUCCESS TOAST
      toast.success(
        `Listing "${data.title || "New Property"}" created successfully!`
      );

      queryClient.invalidateQueries({ queryKey: ["agentListings"] });
      onSuccessCallback(data);
    },
    onError: (error) => {
      // ❌ ERROR TOAST
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create listing. Please check all fields and try again.";

      toast.error(errorMessage);

      onErrorCallback(error);
    },
  });
};

// --------------------------- 2. Amenities Component ---------------------------
const AmenitiesInput = ({ field, error }) => {
  const [inputValue, setInputValue] = useState("");
  const amenities = field.value || [];
  const setAmenities = (newAmenities) => field.onChange(newAmenities);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newAmenity = inputValue.trim().replace(/,$/, "");
      if (newAmenity && !amenities.includes(newAmenity)) {
        setAmenities([...amenities, newAmenity]);
        setInputValue("");
      }
    }
  };

  const removeAmenity = (amenityToRemove) => {
    setAmenities(amenities.filter((a) => a !== amenityToRemove));
  };

  return (
    <div className="space-y-3">
      <label className="block mb-1 text-sm font-medium text-text-primary">
        Amenities (Type and press **Enter** or **Comma** to add)
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
          error ? "border-error" : "border-border focus:border-border-focus"
        }`}
        placeholder="e.g., EV Charging, Private Parking, etc."
      />
      {error && <p className="mt-1 text-xs text-error">{error.message}</p>}
      <div className="flex flex-wrap gap-2 pt-2 min-h-[30px]">
        {amenities.map((amenity, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 text-sm font-medium transition-colors rounded-full cursor-pointer bg-primary-100 text-primary-800 hover:bg-red-100"
            onClick={() => removeAmenity(amenity)}
          >
            {amenity}
            <Icon name="X" size={12} className="ml-1" />
          </span>
        ))}
      </div>
    </div>
  );
};

// --------------------------- 3. Main Component ---------------------------
const QuickListingForm = ({ onClose, onSubmit }) => {
  // --- Configuration ---
  const propertyTypes = [
    "apartment",
    "house",
    "condo",
    "townhouse",
    "land",
    "commercial",
  ];
  // Note: submissionError state is now primarily for debugging/local component display
  // as the toast handles the primary notification.
  const [submissionError, setSubmissionError] = useState(null);

  // --- React Hook Form Setup ---
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      address: "",
      price: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      squareFootage: "",
      description: "",
      lat: "",
      lng: "",
      mlsIntegration: true,
      amenities: [],
    },
  });

  // --- TanStack Query Setup ---
  const { mutate, isPending } = useCreateListingMutation(
    // onSuccess
    (data) => {
      onSubmit?.(data);
      handleClose();
    },
    // onError
    (error) => {
      // The toast call is handled inside the hook now, we only need to set the local state here
      console.error("API Submission Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create listing. Please check all fields and try again.";
      setSubmissionError(errorMessage);
    }
  );

  // --- Final Submission Handler ---
  const onSubmitHandler = (formData) => {
    setSubmissionError(null);

    // 1. Construct the API Payload
    const payload = {
      title: formData.title,
      price: Number(formData.price),
      address: formData.address,
      // Ensure positive numbers by using Math.max(1, value) if RHF validation fails somehow
      bedrooms: Math.max(1, Number(formData.bedrooms)),
      bathrooms: Math.max(1, Number(formData.bathrooms)),
      sqft: Number(formData.squareFootage),
      propertyType: formData.propertyType,
      amenities: formData.amenities,
      description: formData.description,
      images: [],
    };

    // 2. Add coordinates if valid numbers are provided
    if (formData.lat && formData.lng) {
      payload.coordinates = {
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      };
    }

    // 3. Trigger the mutation
    mutate(payload);
  };

  // --- Close Handler ---
  const handleClose = useCallback(() => {
    onClose?.();
    reset();
  }, [onClose, reset]);

  // --------------------------- Render ---------------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-modal">
      <div className="bg-surface rounded-lg shadow-elevation-5 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary font-heading">
              Create New Listing
            </h2>
            <button
              onClick={handleClose}
              className="transition-colors duration-200 text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Form Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit(onSubmitHandler)} className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Section: Basic Info & Price */}
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-medium text-text-primary">
                  Listing Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      {...register("title", { required: "Title is required" })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.title
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="Modern Tech Office Space"
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-error">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Price *
                    </label>
                    <input
                      type="number"
                      {...register("price", {
                        required: "Price is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Must be greater than 0" },
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.price
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="4800000"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-error">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Property Type *
                    </label>
                    <select
                      {...register("propertyType", {
                        required: "Property type is required",
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.propertyType
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                    >
                      <option value="">Select type</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.propertyType && (
                      <p className="mt-1 text-xs text-error">
                        {errors.propertyType.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-medium text-text-primary">
                  Property Address
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Full Street Address *
                    </label>
                    <input
                      type="text"
                      {...register("address", {
                        required: "Full address is required",
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.address
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="220 Innovation Way, Silicon Valley, CA 94025"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-error">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Metrics & Geo-Location */}
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-medium text-text-primary">
                  Metrics & Geo-Location
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Bedrooms */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      {...register("bedrooms", {
                        required: "Required",
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: "Must have at least 1 bedroom",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.bedrooms
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="2"
                    />
                    {errors.bedrooms && (
                      <p className="mt-1 text-xs text-error">
                        {errors.bedrooms.message}
                      </p>
                    )}
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      {...register("bathrooms", {
                        required: "Required",
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: "Must have at least 1 bathroom",
                        },
                        step: 0.5,
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.bathrooms
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="2"
                    />
                    {errors.bathrooms && (
                      <p className="mt-1 text-xs text-error">
                        {errors.bathrooms.message}
                      </p>
                    )}
                  </div>

                  {/* Square Footage (sqft) */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Sq. Footage (sqft) *
                    </label>
                    <input
                      type="number"
                      {...register("squareFootage", {
                        required: "Required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Must be greater than 0" },
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.squareFootage
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="6200"
                    />
                    {errors.squareFootage && (
                      <p className="mt-1 text-xs text-error">
                        {errors.squareFootage.message}
                      </p>
                    )}
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Latitude
                    </label>
                    <input
                      type="number"
                      {...register("lat", {
                        valueAsNumber: true,
                        min: -90,
                        max: 90,
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.lat
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="37.4511"
                      step="any"
                    />
                    {errors.lat && (
                      <p className="mt-1 text-xs text-error">
                        {errors.lat.message}
                      </p>
                    )}
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-text-primary">
                      Longitude
                    </label>
                    <input
                      type="number"
                      {...register("lng", {
                        valueAsNumber: true,
                        min: -180,
                        max: 180,
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors.lng
                          ? "border-error"
                          : "border-border focus:border-border-focus"
                      }`}
                      placeholder="-122.1817"
                      step="any"
                    />
                    {errors.lng && (
                      <p className="mt-1 text-xs text-error">
                        {errors.lng.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Amenities (Using Controller) */}
              <div className="lg:col-span-2">
                <Controller
                  name="amenities"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <AmenitiesInput field={field} error={error} />
                  )}
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block mb-1 text-sm font-medium text-text-primary">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 transition-all duration-200 border rounded-md border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  placeholder="Describe the property features, amenities, and highlights..."
                />
              </div>

              {/* MLS Integration */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("mlsIntegration")}
                    className="rounded border-border text-primary focus:ring-primary-500"
                    id="mls-integration"
                  />
                  <label
                    htmlFor="mls-integration"
                    className="text-sm text-text-primary"
                  >
                    Sync with MLS
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 pb-5 border-t border-border">
          {submissionError && (
            <p className="mb-4 text-sm text-right text-error">
              **Error:** {submissionError}
            </p>
          )}
          <div className="flex justify-end mb-4 space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 transition-colors duration-200 text-text-secondary hover:text-text-primary"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit(onSubmitHandler)}
              disabled={isPending}
              className="px-6 py-2 font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed micro-interaction"
            >
              {isPending ? (
                <>
                  <Icon
                    name="Loader"
                    size={16}
                    className="inline mr-2 animate-spin"
                  />
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickListingForm;
