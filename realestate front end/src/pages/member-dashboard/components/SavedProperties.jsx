// src/pages/member-dashboard/components/SavedProperties.jsx
import React, { useEffect, useState } from "react";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_SAVED = [
  {
    id: 1,
    title: "Luxury Villa",
    type: "Villa",
    price: "$500,000",
    location: "Miami",
    agent: "John Smith",
  },
  {
    id: 2,
    title: "Modern Apartment",
    type: "Apartment",
    price: "$200,000",
    location: "New York",
    agent: "Jane Doe",
  },
];

const SavedProperties = () => {
  const api = useAxiosSecure();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setSaved(MOCK_SAVED);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/member/saved-properties"); // future API
        if (!mounted) return;
        setSaved(res?.data?.data || MOCK_SAVED);
      } catch (err) {
        console.warn("Failed to fetch saved properties", err);
        setSaved(MOCK_SAVED);
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
        <h1 className="text-2xl font-bold text-text-primary">
          Saved Properties
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-secondary-100 animate-pulse rounded-2xl"
              />
            ))
          : saved.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between p-4 bg-white shadow rounded-2xl"
              >
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {p.title}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {p.type} · {p.location}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary">{p.price}</span>
                  <button className="px-3 py-1 text-xs text-white rounded bg-primary">
                    View
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default SavedProperties;
