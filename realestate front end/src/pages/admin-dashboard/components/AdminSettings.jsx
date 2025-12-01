import React, { useState } from "react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    enableNewUserRegistration: true,
    defaultUserRole: "member",
    emailNotifications: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: send updated settings to backend
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-8">
      {" "}
      <h1 className="mb-2 text-3xl font-bold text-text-primary">
        Admin Settings
      </h1>{" "}
      <p className="text-text-secondary">
        Configure system settings, user permissions, and site preferences.{" "}
      </p>
      <div className="p-6 space-y-6 bg-white shadow rounded-2xl">
        {/* User Registration Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text-primary">
              Enable New User Registration
            </h3>
            <p className="text-sm text-text-secondary">
              Allow users to register on the site
            </p>
          </div>
          <button
            onClick={() => handleToggle("enableNewUserRegistration")}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.enableNewUserRegistration ? "bg-primary" : "bg-gray-300"
            } relative`}
          >
            <span
              className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                settings.enableNewUserRegistration
                  ? "translate-x-6"
                  : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>

        {/* Default User Role */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text-primary">Default User Role</h3>
            <p className="text-sm text-text-secondary">
              Set default role for new users
            </p>
          </div>
          <select
            name="defaultUserRole"
            value={settings.defaultUserRole}
            onChange={handleSelectChange}
            className="px-10 py-2 border rounded"
          >
            <option value="member">Member</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text-primary">
              Email Notifications
            </h3>
            <p className="text-sm text-text-secondary">
              Send emails for important events
            </p>
          </div>
          <button
            onClick={() => handleToggle("emailNotifications")}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.emailNotifications ? "bg-primary" : "bg-gray-300"
            } relative`}
          >
            <span
              className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                settings.emailNotifications ? "translate-x-6" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 font-medium text-white transition bg-primary rounded-2xl hover:bg-primary-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
