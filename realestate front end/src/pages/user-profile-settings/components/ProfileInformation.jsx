// src/pages/user-profile-settings/components/ProfileInformation.jsx
import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthContext from "hooks/useAuthContext";
import useAxiosSecure from "hooks/useAxiosSecure";

const ProfileInformation = ({ onDataChange }) => {
  const { user, setUser } = useAuthContext();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
    mode: "onChange",
  });

  const [avatar, setAvatar] = useState(user?.avatar);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImagePreviewUrl, setTempImagePreviewUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
    setAvatar(user?.avatar);
    setStatusMessage(null);
    setErrorMessage(null);
  }, [user, reset]);

  // User profile update
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

      if (data?.user && typeof setUser === "function") {
        setUser(data.user);
      } else if (typeof setUser === "function") {
        setUser((prev) => ({ ...prev, ...variables }));
      }

      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
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

  // Avatar upload
  const {
    mutate: uploadAvatar,
    isPending: isUploadingAvatar,
    error: uploadError,
  } = useMutation({
    mutationFn: async (file) => {
      const data = new FormData();
      data.append("avatar", file);
      const res = await axiosSecure.post("/users/upload-avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setStatusMessage(data?.message || "Profile photo updated successfully.");
      setErrorMessage(null);

      const newAvatarUrl = data?.avatarUrl;
      if (newAvatarUrl && typeof setUser === "function") {
        setAvatar(newAvatarUrl);
        setUser((prevUser) => ({ ...prevUser, avatar: newAvatarUrl }));
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

  const handleFormSubmit = (data) => saveProfileFields(data);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Avatar too large (max 5MB).");
        event.target.value = null;
        return;
      }
      const allowedFileTypes = /jpe?g|png|avif/;
      const fileName = file.name.toLowerCase();
      if (!allowedFileTypes.test(fileName.split(".").pop())) {
        setErrorMessage(
          "Invalid file type. Only JPEG, PNG, and AVIF are allowed."
        );
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
    if (tempImageFile) uploadAvatar(tempImageFile);
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
    reset();
    setAvatar(user?.avatar || "/assets/images/john.avif");
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const renderAvatar = () => {
    if (avatar) {
      return (
        <img
          src={avatar}
          alt="Profile"
          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/assets/images/john.avif";
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

  const displayErrorMessage =
    errorMessage ||
    saveError?.message ||
    uploadError?.message ||
    saveError?.response?.data?.message ||
    uploadError?.response?.data?.message;

  return (
    <div className="rounded-lg bg-surface shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary font-heading">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Update your personal information and profile photo
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
        {/* Avatar Section */}
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-text-primary">
              Full Name *
            </label>
            <input
              type="text"
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
            <label className="block mb-2 text-sm font-medium text-text-primary">
              Email Address *
            </label>
            <input
              type="email"
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
            <label className="block mb-2 text-sm font-medium text-text-primary">
              Phone Number
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-text-primary">
              Bio
            </label>
            <textarea
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
              placeholder="Write a short bio..."
              maxLength={500}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
            )}
          </div>
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
              disabled={isSaving || !isDirty || Object.keys(errors).length > 0}
              className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving || isUploadingAvatar}
              className="px-4 py-2 text-sm font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

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
