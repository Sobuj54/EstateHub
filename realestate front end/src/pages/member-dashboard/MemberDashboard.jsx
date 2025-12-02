// src/pages/member-dashboard/MemberDashboard.jsx
import React, { useEffect, useState } from "react";
import Icon from "components/AppIcon";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK = {
  stats: {
    savedProperties: 8,
    upcomingAppointments: 3,
    messagesUnread: 5,
    notifications: 7,
  },
  recentProperties: [
    { id: 1, title: "Luxury Villa", agent: "John Smith", date: "2025-11-25" },
    { id: 2, title: "Modern Apartment", agent: "Jane Doe", date: "2025-11-24" },
    {
      id: 3,
      title: "Countryside House",
      agent: "Alan Poe",
      date: "2025-11-20",
    },
  ],
  upcomingAppointments: [
    {
      id: 1,
      property: "Beachside Condo",
      date: "2025-12-05",
      agent: "John Smith",
    },
    {
      id: 2,
      property: "Mountain Cabin",
      date: "2025-12-10",
      agent: "Alice Grey",
    },
  ],
};

const MemberDashboard = () => {
  const api = useAxiosSecure();
  const [stats, setStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [mockMode, setMockMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setStats(MOCK.stats);
        setRecentProperties(MOCK.recentProperties);
        setAppointments(MOCK.upcomingAppointments);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/member/dashboard"); // placeholder for API
        const d = res?.data?.data || null;
        if (!mounted) return;
        if (d) {
          setStats(d.stats);
          setRecentProperties(d.recentProperties);
          setAppointments(d.appointments);
        } else {
          setStats(MOCK.stats);
          setRecentProperties(MOCK.recentProperties);
          setAppointments(MOCK.upcomingAppointments);
        }
      } catch (err) {
        console.warn("Failed to fetch member dashboard, using mock", err);
        setStats(MOCK.stats);
        setRecentProperties(MOCK.recentProperties);
        setAppointments(MOCK.upcomingAppointments);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, mockMode]);

  if (loading && !stats) {
    return (
      <div>
        <div className="w-1/2 h-8 mb-6 rounded bg-secondary-100 animate-pulse sm:w-1/4" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-secondary-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold sm:text-3xl text-text-primary">
          Member Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center space-x-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>Use mock data</span>
          </label>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">
            Saved Properties
          </h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.savedProperties}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Your favorites</p>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">
            Upcoming Appointments
          </h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.upcomingAppointments}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Visits scheduled</p>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">
            Unread Messages
          </h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.messagesUnread}
          </p>
          <p className="mt-1 text-xs text-text-secondary">From agents</p>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">
            Notifications
          </h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.notifications}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Alerts & updates</p>
        </div>
      </div>

      {/* Recent Properties + Appointments */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-4 bg-white shadow sm:p-6 md:col-span-2 rounded-2xl">
          <h2 className="mb-4 text-base font-semibold sm:text-lg text-text-primary">
            Recently Viewed Properties
          </h2>
          <ul className="divide-y divide-gray-100">
            {recentProperties.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-text-primary">{p.title}</div>
                  <div className="text-xs text-text-secondary">
                    {p.agent} · {p.date}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-xs text-white rounded bg-primary">
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h2 className="mb-4 text-base font-semibold sm:text-lg text-text-primary">
            Upcoming Appointments
          </h2>
          <ul className="divide-y divide-gray-100">
            {appointments.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-text-primary">
                    {a.property}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {a.agent} · {a.date}
                  </div>
                </div>
                <div>
                  <button className="px-3 py-1 text-xs border rounded">
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
