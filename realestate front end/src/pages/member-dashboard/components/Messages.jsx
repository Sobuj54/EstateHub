// src/pages/member-dashboard/components/Messages.jsx
import React, { useEffect, useState } from "react";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_MESSAGES = [
  {
    id: 1,
    from: "John Smith",
    subject: "Property Inquiry",
    date: "2025-12-01",
    status: "Unread",
  },
  {
    id: 2,
    from: "Jane Doe",
    subject: "Appointment Confirmation",
    date: "2025-11-28",
    status: "Read",
  },
  {
    id: 3,
    from: "Alan Poe",
    subject: "New Listing Alert",
    date: "2025-11-25",
    status: "Unread",
  },
];

const Messages = () => {
  const api = useAxiosSecure();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setMessages(MOCK_MESSAGES);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/member/messages"); // future API
        if (!mounted) return;
        setMessages(res?.data?.data || MOCK_MESSAGES);
      } catch (err) {
        console.warn("Failed to fetch messages", err);
        setMessages(MOCK_MESSAGES);
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
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
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

      {/* Large Screen Table */}
      <div className="hidden overflow-hidden bg-white shadow md:block rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                From
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Subject
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
              ? [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="w-3/4 h-4 rounded bg-secondary-100 animate-pulse" />
                    </td>
                  </tr>
                ))
              : messages.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4">{m.from}</td>
                    <td className="px-6 py-4">{m.subject}</td>
                    <td className="px-6 py-4">{m.date}</td>
                    <td className="px-6 py-4">{m.status}</td>
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
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 p-4 bg-white shadow rounded-2xl animate-pulse"
              />
            ))
          : messages.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-2 p-4 bg-white shadow rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text-primary">{m.subject}</h3>
                  <span
                    className={`px-2 py-0.5 text-xxs font-semibold rounded ${
                      m.status === "Unread"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">From: {m.from}</p>
                <p className="text-xs text-text-secondary">Date: {m.date}</p>
                <button className="self-start px-3 py-1 text-xs text-white rounded bg-primary">
                  View
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Messages;
