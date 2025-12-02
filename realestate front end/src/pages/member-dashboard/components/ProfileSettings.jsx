// src/pages/member-dashboard/components/ProfileSettings.jsx
import React, { useState, useEffect } from "react";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_PROFILE = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Real Estate Ave, City, State 12345",
};

const ProfileSettings = () => {
  const api = useAxiosSecure();
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mockMode) {
        if (!mounted) return;
        setProfile(MOCK_PROFILE);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/member/profile"); // future API
        if (!mounted) return;
        setProfile(res?.data?.data || MOCK_PROFILE);
      } catch (err) {
        console.warn("Failed to fetch profile", err);
        setProfile(MOCK_PROFILE);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api, mockMode]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Save profile", profile);
    // TODO: API call to save profile
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          Profile Settings
        </h1>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(e) => setMockMode(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          Use mock data
        </label>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-full h-10 rounded bg-secondary-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 bg-white shadow rounded-2xl"
        >
          <div>
            <label className="block mb-1 text-xs text-text-secondary">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs text-text-secondary">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs text-text-secondary">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs text-text-secondary">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 font-medium text-white transition-all duration-200 rounded-md bg-primary hover:bg-primary-700"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
