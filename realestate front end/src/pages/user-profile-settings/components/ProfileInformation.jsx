// src/pages/user-profile-settings/components/ProfileInformation.jsx
import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/AppIcon";
// Import useForm for React Hook Form
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthContext from "hooks/useAuthContext";
import useAxiosSecure from "hooks/useAxiosSecure";

const ProfileInformation = ({ onDataChange }) => {
  const { user, setUser } = useAuthContext();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // ⭐️ REACT HOOK FORM INITIALIZATION ⭐️
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    // Initialize form with user data from context
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  // --- LOCAL/PRESENTATIONAL STATE ---

  const [avatar, setAvatar] = useState(user?.avatar);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImagePreviewUrl, setTempImagePreviewUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  // --- SYNCHRONIZATION WITH CONTEXT ---

  // Use useEffect to reset the form's state when the user object changes (e.g., after login or successful save)
  useEffect(() => {
    const defaultValues = {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    };
    reset(defaultValues);
    setAvatar(user?.avatar);
    setStatusMessage(null);
    setErrorMessage(null);
  }, [user, reset]); // 'reset' is a stable function from useForm

  // --- TANSTACK QUERY MUTATIONS ---

  // 1. Mutation for Profile Text Fields (PATCH)
  const {
    mutate: saveProfileFields,
    isPending: isSaving,
    error: saveError,
  } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.patch("/users/profile", payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      setStatusMessage(data?.message || "Profile updated successfully.");
      setErrorMessage(null);

      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });

      if (data?.user && typeof setUser === "function") {
        // Update context with returned user
        setUser(data.user);
      } else if (typeof setUser === "function") {
        // Optimistically update context with the fields that were saved (variables)
        setUser((prev) => ({ ...prev, ...variables }));
      }

      // Reset form state to indicate that the form is clean after successful save
      reset(variables);
      onDataChange?.();
    },
    onError: (err) => {
      console.error("Profile update failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update profile. Please try again.";
      setErrorMessage(message);
      setStatusMessage(null);
      onDataChange?.();
    },
  });

  // 2. Mutation for Avatar Upload (POST multipart/form-data)
  const {
    mutate: uploadAvatar,
    isPending: isUploadingAvatar,
    error: uploadError,
  } = useMutation({
    mutationFn: async (file) => {
      const data = new FormData();
      data.append("avatar", file);

      const res = await axiosSecure.post("/users/upload-avatar", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setStatusMessage(data?.message || "Profile photo updated successfully.");
      setErrorMessage(null);

      const newAvatarUrl = data?.avatarUrl;

      if (newAvatarUrl) {
        setAvatar(newAvatarUrl);
        if (typeof setUser === "function") {
          setUser((prevUser) => ({ ...prevUser, avatar: newAvatarUrl }));
        }
      }

      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      onDataChange?.();
    },
    onError: (err) => {
      console.error("Avatar upload failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to upload profile photo. Please try again.";
      setErrorMessage(message);
      setStatusMessage(null);
      onDataChange?.();
    },
  });

  // --- HANDLERS ---

  // RHF takes over primary submission via 'handleSubmit'
  const handleFormSubmit = (data) => {
    // data contains the validated form fields.
    saveProfileFields(data);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Avatar too large (max 5MB).");
        event.target.value = null;
        return;
      }
      const allowedFileTypes = /jpe?g|png|avif/; // Matches jpeg, jpg, png, or avif
      const fileName = file.name.toLowerCase();

      // Extract the extension from the file name and test against the regex
      const extensionMatches = allowedFileTypes.test(fileName.split(".").pop());

      if (!extensionMatches) {
        setErrorMessage(
          "Invalid file type. Only JPEG, PNG, and AVIF are allowed."
        );
        // Clear the input field
        event.target.value = null;
        return;
      }
      setTempImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImagePreviewUrl(e.target?.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null;
  };

  const handleCropSave = () => {
    if (tempImageFile) {
      uploadAvatar(tempImageFile);
    }
    setShowCropModal(false);
    setTempImageFile(null);
    setTempImagePreviewUrl(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageFile(null);
    setTempImagePreviewUrl(null);
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = "/assets/images/profile_default.png";
    setAvatar(defaultAvatar);

    if (typeof setUser === "function") {
      setUser((prevUser) => ({ ...prevUser, avatar: defaultAvatar }));
    }
    onDataChange?.();
  };

  const handleCancel = () => {
    // Use the RHF 'reset' function to revert all fields to their defaultValues (from context)
    reset();
    setAvatar(user?.avatar || "/assets/images/john.avif");
    setStatusMessage(null);
    setErrorMessage(null);
  };

  // avatar render helper (no change needed here)
  const renderAvatar = () => {
    if (avatar) {
      return (
        <img
          src={avatar}
          alt="Profile"
          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/assets/images/john.avif"; // Fallback
          }}
        />
      );
    }

    const initials = (user?.name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div className="flex items-center justify-center w-full h-full text-white">
        {initials || "U"}
      </div>
    );
  };

  // Consolidate the error message display
  const displayErrorMessage =
    errorMessage ||
    saveError?.message ||
    uploadError?.message ||
    saveError?.response?.data?.message ||
    uploadError?.response?.data?.message;

  return (
    <div className="rounded-lg bg-surface shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary font-heading">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Update your personal information and profile photo
        </p>
      </div>

      {/* ⭐️ Use RHF's handleSubmit and link to the mutation handler ⭐️ */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
        {/* Profile Photo Section (UI unchanged) */}
        <div className="flex flex-col mb-8 sm:flex-row sm:items-center sm:space-x-6">
          <div className="relative group">
            <div
              className="w-24 h-24 overflow-hidden rounded-full cursor-pointer bg-secondary-100"
              onClick={handleAvatarClick}
              role="button"
              aria-label="Upload profile photo"
            >
              {renderAvatar()}
            </div>

            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100"
            >
              <Icon name="Camera" size={20} className="text-white" />
            </button>
          </div>

          <div className="flex-1 mt-4 sm:mt-0">
            <h3 className="text-lg font-medium text-text-primary">
              {user?.name}
            </h3>
            <p className="mb-3 text-sm text-text-secondary">
              Click on the photo to upload a new profile picture
            </p>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleAvatarClick}
                // Disable while an avatar is uploading
                disabled={isUploadingAvatar}
                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700"
              >
                {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
              </button>

              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-4 py-2 text-sm font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields - Updated with RHF 'register' and 'errors' */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Full Name is required" })}
              className={`block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm ${
                errors.name ? "border-red-500" : "border-border"
              } focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className={`block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm ${
                errors.email ? "border-red-500" : "border-border"
              } focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              {...register("location")}
              className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
              placeholder="City, State"
            />
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="block mb-2 text-sm font-medium text-text-primary"
            >
              Website
            </label>
            <input
              type="url"
              id="website"
              {...register("website", {
                pattern: {
                  value: /^(ftp|http|https):\/\/[^ "]+$/i,
                  message: "Invalid URL format",
                },
              })}
              className={`block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm ${
                errors.website ? "border-red-500" : "border-border"
              } focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary`}
              placeholder="https://www.yourwebsite.com"
            />
            {errors.website && (
              <p className="mt-1 text-xs text-red-500">
                {errors.website.message}
              </p>
            )}
          </div>

          {/* Bio (agent only) */}
          {user?.role === "agent" && (
            <div className="md:col-span-2">
              <label
                htmlFor="bio"
                className="block mb-2 text-sm font-medium text-text-primary"
              >
                Professional Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                {...register("bio", {
                  maxLength: {
                    value: 500,
                    message: "Bio cannot exceed 500 characters",
                  },
                })}
                className={`block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm resize-none ${
                  errors.bio ? "border-red-500" : "border-border"
                } focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary`}
                placeholder="Tell potential clients about your experience and expertise..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-text-secondary">
                {/* Note: Getting the live character count requires watching the field, 
                but using default RHF handling for brevity here */}
                Max 500 characters
              </p>
              {errors.bio && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.bio.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Messages & Actions */}
        <div className="mt-6 space-y-3">
          {statusMessage && (
            <div className="text-sm text-green-600">{statusMessage}</div>
          )}
          {displayErrorMessage && (
            <div className="text-sm text-red-600">{displayErrorMessage}</div>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              // Disable if saving, or if there are RHF errors, or if the form is not dirty (no changes made)
              disabled={isSaving || !isDirty || Object.keys(errors).length > 0}
              className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              // Disable if saving or uploading (to prevent state conflicts)
              disabled={isSaving || isUploadingAvatar}
              className="px-4 py-2 text-sm font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Hidden File Input (unchanged) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Crop Modal (UI unchanged, uses RHF state for disabled check) */}
      {showCropModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-modal">
          <div className="w-full max-w-md p-6 rounded-lg shadow-xl bg-surface">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Crop Profile Photo
            </h3>

            <div className="mb-6">
              <div className="flex items-center justify-center w-full h-64 overflow-hidden rounded-lg bg-secondary-100">
                {tempImagePreviewUrl && (
                  <img
                    src={tempImagePreviewUrl}
                    alt="Preview"
                    className="object-contain max-w-full max-h-full"
                  />
                )}
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Crop functionality would be implemented here with a proper image
                cropping library
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCropSave}
                disabled={isSaving || isUploadingAvatar}
                className="flex-1 px-4 py-2 font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700 disabled:opacity-50"
              >
                {isUploadingAvatar ? "Uploading..." : "Save"}
              </button>
              <button
                onClick={handleCropCancel}
                disabled={isUploadingAvatar}
                className="flex-1 px-4 py-2 font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInformation;
