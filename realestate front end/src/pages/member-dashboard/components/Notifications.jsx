// src/pages/member-dashboard/components/Notifications.jsx
import React, { useEffect, useState } from "react";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "Your appointment with John Smith is confirmed",
    date: "2025-12-01",
    read: false,
  },
  {
    id: 2,
    message: "New property matching your search criteria: Luxury Villa",
    date: "2025-11-28",
    read: true,
  },
  {
    id: 3,
    message: "Price drop alert: Modern Apartment",
    date: "2025-11-25",
    read: false,
  },
];

const Notifications = () => {
  const api = useAxiosSecure();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setNotifications(MOCK_NOTIFICATIONS);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/member/notifications"); // future API
        if (!mounted) return;
        setNotifications(res?.data?.data || MOCK_NOTIFICATIONS);
      } catch (err) {
        console.warn("Failed to fetch notifications", err);
        setNotifications(MOCK_NOTIFICATIONS);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api, mockMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
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

      <ul className="bg-white divide-y divide-gray-100 shadow rounded-2xl">
        {loading
          ? [...Array(3)].map((_, i) => (
              <li key={i} className="px-6 py-4">
                <div className="w-3/4 h-4 rounded bg-secondary-100 animate-pulse" />
              </li>
            ))
          : notifications.map((n) => (
              <li
                key={n.id}
                className={`px-6 py-4 ${
                  n.read ? "bg-secondary-50" : "bg-secondary-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-primary">{n.message}</p>
                  <span className="text-xxs text-text-secondary">{n.date}</span>
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
};

export default Notifications;
