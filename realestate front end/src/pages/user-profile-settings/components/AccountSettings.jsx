import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";
import { toast } from "react-toastify";

const passwordRegex = /(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

const AccountSettings = ({ onDataChange }) => {
  const axiosSecure = useAxiosSecure();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // --- Mutation ---
  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: async ({ oldPassword, newPassword }) => {
        const res = await axiosSecure.patch("/auth/change-password", {
          oldPassword,
          newPassword,
        });
        return res.data;
      },
      onSuccess: (data) => {
        toast.success(data?.message || "Password changed successfully");
        setShowPasswordForm(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPassword({
          oldPassword: false,
          newPassword: false,
          confirmPassword: false,
        });
        onDataChange?.();
      },
      onError: (err) => {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to change password. Please try again.";
        toast.error(message);
      },
    }
  );

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "New password must contain at least 1 uppercase letter, 1 number, and 1 special character"
      );
      return;
    }

    changePassword({ oldPassword, newPassword });
  };

  const renderPasswordInput = (id, label, value, showField) => (
    <div className="relative">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-text-primary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showField ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => handlePasswordChange(id, e.target.value)}
          className="block w-full px-4 py-3 pr-10 transition-all duration-200 border rounded-md shadow-sm border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500"
          required
        />
        <button
          type="button"
          onClick={() => toggleShowPassword(id)}
          className="absolute inset-y-0 flex items-center right-3"
          tabIndex={-1}
        >
          <Icon name={showField ? "EyeOff" : "Eye"} size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Password Settings */}
      <div className="rounded-lg bg-surface shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Password & Security
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your password and security settings
          </p>
        </div>

        <div className="p-6">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-text-primary">
                  Password
                </h3>
                <p className="text-sm text-text-secondary">
                  Last changed 3 months ago
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {renderPasswordInput(
                "oldPassword",
                "Old Password",
                passwordData.oldPassword,
                showPassword.oldPassword
              )}
              {renderPasswordInput(
                "newPassword",
                "New Password",
                passwordData.newPassword,
                showPassword.newPassword
              )}
              {renderPasswordInput(
                "confirmPassword",
                "Confirm New Password",
                passwordData.confirmPassword,
                showPassword.confirmPassword
              )}

              <div className="flex pt-4 space-x-3">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 font-medium text-white transition-colors duration-200 rounded-md bg-primary hover:bg-primary-700 disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setShowPassword({
                      oldPassword: false,
                      newPassword: false,
                      confirmPassword: false,
                    });
                  }}
                  className="px-4 py-2 font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Email Preferences and Notification Settings remain the same */}
    </div>
  );
};

export default AccountSettings;
