// src/pages/member-dashboard/components/SearchProperties.jsx
import React, { useEffect, useState } from "react";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_PROPERTIES = [
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
  {
    id: 3,
    title: "Countryside House",
    type: "House",
    price: "$150,000",
    location: "Texas",
    agent: "Alan Poe",
  },
];

const SearchProperties = () => {
  const api = useAxiosSecure();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setProperties(MOCK_PROPERTIES);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/member/properties"); // future API
        if (!mounted) return;
        setProperties(res?.data?.data || MOCK_PROPERTIES);
      } catch (err) {
        console.warn("Failed to fetch properties, using mock data", err);
        setProperties(MOCK_PROPERTIES);
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
          Search Properties
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
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-secondary-100 animate-pulse rounded-2xl"
              />
            ))
          : properties.map((p) => (
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

export default SearchProperties;
