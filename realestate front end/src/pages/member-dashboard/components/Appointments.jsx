// src/pages/member-dashboard/components/Appointments.jsx
import React, { useEffect, useState } from "react";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_APPOINTMENTS = [
  {
    id: 1,
    property: "Beachside Condo",
    date: "2025-12-05",
    agent: "John Smith",
    status: "Confirmed",
  },
  {
    id: 2,
    property: "Mountain Cabin",
    date: "2025-12-10",
    agent: "Alice Grey",
    status: "Pending",
  },
];

const Appointments = () => {
  const api = useAxiosSecure();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setAppointments(MOCK_APPOINTMENTS);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/member/appointments"); // future API
        if (!mounted) return;
        setAppointments(res?.data?.data || MOCK_APPOINTMENTS);
      } catch (err) {
        console.warn("Failed to fetch appointments", err);
        setAppointments(MOCK_APPOINTMENTS);
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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
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

      {/* Responsive Table for large screens */}
      <div className="hidden overflow-hidden bg-white shadow md:block rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Property
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Agent
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Status
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? [...Array(2)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="w-3/4 h-4 rounded bg-secondary-100 animate-pulse" />
                    </td>
                  </tr>
                ))
              : appointments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4">{a.property}</td>
                    <td className="px-6 py-4">{a.agent}</td>
                    <td className="px-6 py-4">{a.date}</td>
                    <td className="px-6 py-4">{a.status}</td>
                    <td className="px-6 py-4">
                      <button className="px-3 py-1 text-xs text-white rounded bg-primary">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {loading
          ? [...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-24 p-4 bg-white shadow rounded-2xl animate-pulse"
              />
            ))
          : appointments.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 p-4 bg-white shadow rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text-primary">
                    {a.property}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xxs font-semibold rounded ${
                      a.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">Agent: {a.agent}</p>
                <p className="text-xs text-text-secondary">Date: {a.date}</p>
                <button className="self-start px-3 py-1 text-xs text-white rounded bg-primary">
                  View
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Appointments;
