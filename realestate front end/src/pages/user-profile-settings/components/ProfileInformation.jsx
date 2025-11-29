// src/pages/user-profile-settings/components/ProfileInformation.jsx
import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import axios from "axios";
import useAuthContext from "hooks/useAuthContext";

const ProfileInformation = ({ onDataChange }) => {
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });

  const [avatar, setAvatar] = useState(
    user?.avatar || "/assets/images/john.avif"
  );
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  // Keep local formData in sync when context user changes (e.g. on login)
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    });
    setAvatar(user?.avatar || "/assets/images/john.avif");
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatusMessage(null);
    setErrorMessage(null);
    onDataChange?.(); // notify parent if needed
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // quick client validation
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Avatar too large (max 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e.target?.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = () => {
    if (tempImage) {
      setAvatar(tempImage);
      onDataChange?.();
    }
    setShowCropModal(false);
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImage(null);
  };

  // Save profile (non-avatar fields). Avatar upload would require multipart/form-data and a different endpoint.
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
      };

      const res = await axios.patch("/api/user/profile", payload);

      // success UX
      setStatusMessage(res?.data?.message || "Profile updated successfully.");

      // update auth context with returned user if backend provides it
      const returnedUser = res?.data?.user;
      if (returnedUser) {
        if (typeof updateUser === "function") {
          updateUser(returnedUser);
        } else if (typeof setUser === "function") {
          setUser(returnedUser);
        } else {
          // fallback: merge local user fields (non-ideal but functional)
          // Note: no direct way to set context user if hook doesn't provide updater.
          console.warn(
            "Auth context does not expose updateUser or setUser — local UI updated only."
          );
        }
      } else {
        // If backend doesn't return full user, optimistically update local copy of form data
        if (typeof updateUser === "function") {
          updateUser({ ...user, ...payload });
        } else if (typeof setUser === "function") {
          setUser({ ...user, ...payload });
        }
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      // prefer structured error messages from server
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update profile. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
      onDataChange?.();
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar("/assets/images/profile_default.png");
    // call onDataChange or optionally call avatar delete endpoint
    onDataChange?.();
  };

  // avatar render helper
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

    const initials = (formData.name || "")
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

      <form onSubmit={handleSave} className="p-6">
        {/* Profile Photo Section */}
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
              {formData.name || user?.name}
            </h3>
            <p className="mb-3 text-sm text-text-secondary">
              Click on the photo to upload a new profile picture
            </p>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700"
              >
                Upload Photo
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
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
              placeholder="Enter your full name"
              required
            />
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
              placeholder="your.email@example.com"
              required
            />
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
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
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
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
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
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
              placeholder="https://www.yourwebsite.com"
            />
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
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="block w-full px-4 py-3 transition-all duration-200 border rounded-md shadow-sm resize-none border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
                placeholder="Tell potential clients about your experience and expertise..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-text-secondary">
                {formData.bio.length}/500 characters
              </p>
            </div>
          )}
        </div>

        {/* Messages & Actions */}
        <div className="mt-6 space-y-3">
          {statusMessage && (
            <div className="text-sm text-green-600">{statusMessage}</div>
          )}
          {errorMessage && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                // reset local edits back to latest context user
                setFormData({
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                  bio: user?.bio || "",
                  location: user?.location || "",
                  website: user?.website || "",
                });
                setAvatar(user?.avatar || "/assets/images/john.avif");
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className="px-4 py-2 text-sm font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-modal">
          <div className="w-full max-w-md p-6 rounded-lg shadow-xl bg-surface">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Crop Profile Photo
            </h3>

            <div className="mb-6">
              <div className="flex items-center justify-center w-full h-64 overflow-hidden rounded-lg bg-secondary-100">
                {tempImage && (
                  <img
                    src={tempImage}
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
                className="flex-1 px-4 py-2 font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700"
              >
                Save
              </button>
              <button
                onClick={handleCropCancel}
                className="flex-1 px-4 py-2 font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100"
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
