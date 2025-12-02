// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import Icon from "components/AppIcon";
import useAxiosSecure from "hooks/useAxiosSecure";

// MOCK data remains the same...
const MOCK = {
  stats: {
    totalAgents: 12,
    totalMembers: 50,
    totalProperties: 120,
    propertiesThisMonth: 8,
    newMembers: 5,
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
  topAgents: [
    { id: 1, name: "John Smith", properties: 20 },
    { id: 2, name: "Jane Doe", properties: 15 },
    { id: 3, name: "Alice Grey", properties: 12 },
  ],
};

const AdminDashboard = () => {
  const api = useAxiosSecure();
  const [stats, setStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // ... useEffect logic remains the same ...

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      // if mockMode enabled, skip API and use mock immediately
      if (mockMode) {
        if (!mounted) return;
        setStats(MOCK.stats);
        setRecentProperties(MOCK.recentProperties);
        setTopAgents(MOCK.topAgents);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/admin/stats");
        // backend might return data shaped differently; prefer res.data.data or res.data
        const d = res?.data?.data || res?.data || null;

        if (!mounted) return;

        if (d) {
          // if backend provides full payload, use it; else fall back to partial/mock
          setStats({
            totalAgents: d.totalAgents ?? d.agents ?? MOCK.stats.totalAgents,
            totalMembers:
              d.totalMembers ?? d.members ?? MOCK.stats.totalMembers,
            totalProperties:
              d.totalProperties ?? d.properties ?? MOCK.stats.totalProperties,
            propertiesThisMonth:
              d.propertiesThisMonth ?? MOCK.stats.propertiesThisMonth,
            newMembers: d.newMembers ?? MOCK.stats.newMembers,
          });
          setRecentProperties(d.recentProperties ?? MOCK.recentProperties);
          setTopAgents(d.topAgents ?? MOCK.topAgents);
        } else {
          // no data returned — use mock
          setStats(MOCK.stats);
          setRecentProperties(MOCK.recentProperties);
          setTopAgents(MOCK.topAgents);
        }
      } catch (err) {
        // network / CORS / backend down — fall back to mock data
        console.warn(
          "AdminDashboard: failed to fetch stats, using mock data.",
          err
        );
        if (!mounted) return;
        setStats(MOCK.stats);
        setRecentProperties(MOCK.recentProperties);
        setTopAgents(MOCK.topAgents);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, mockMode]);

  // show skeleton while first loading
  if (loading && !mockMode && !stats) {
    return (
      <div>
        {/* Adjusted w-1/4 to w-1/2 for smaller screens */}
        <div className="w-1/2 h-8 mb-6 rounded bg-secondary-100 animate-pulse sm:w-1/4" />
        {/* Adjusted to grid-cols-2 for smaller screens */}
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
      {/* dev banner + mock toggle */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {" "}
        {/* Adjusted to stack on mobile */}
        <h1 className="text-2xl font-bold sm:text-3xl text-text-primary">
          {" "}
          {/* Adjusted font size */}
          Admin Dashboard
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

          <button
            onClick={() => {
              // export current visible stats as CSV (very small helper)
              const csv = [
                ["metric", "value"],
                ["totalAgents", stats.totalAgents],
                ["totalMembers", stats.totalMembers],
                ["totalProperties", stats.totalProperties],
                ["propertiesThisMonth", stats.propertiesThisMonth],
              ]
                .map((r) => r.join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `admin-stats-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 text-sm font-medium text-white rounded-md bg-primary"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* mock mode indicator */}
      {mockMode && (
        <div className="flex items-center p-3 text-sm text-yellow-800 border border-yellow-100 rounded-md bg-yellow-50">
          {" "}
          {/* Adjusted padding */}
          <Icon name="Info" size={16} className="mr-2" />
          <div>
            <strong>Mock mode</strong> — data shown is mock. Toggle off to
            attempt fetching from API.
          </div>
        </div>
      )}

      {/* stat cards */}
      {/* Changed sm:grid-cols-2 lg:grid-cols-4 to mobile-first grid-cols-2 md:grid-cols-4 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          {" "}
          {/* Reduced padding for small screens */}
          <h3 className="text-sm font-medium text-text-secondary">
            Agents
          </h3>{" "}
          {/* Adjusted font size */}
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {" "}
            {/* Adjusted font size */}
            {stats.totalAgents}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Active agents</p>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">Members</h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.totalMembers}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Total registered users
          </p>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">
            Properties
          </h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.totalProperties}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Total listings</p>
        </div>

        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">
            New This Month
          </h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
            {stats.propertiesThisMonth}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {stats.newMembers} new members
          </p>
        </div>
      </div>

      {/* main content */}
      {/* Changed lg:grid-cols-3 to mobile-first grid-cols-1 md:grid-cols-3 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Recent Properties (takes full width on mobile, 2/3 on desktop) */}
        <div className="p-4 bg-white shadow sm:p-6 md:col-span-2 rounded-2xl">
          {" "}
          {/* Adjusted padding */}
          <h2 className="mb-4 text-base font-semibold sm:text-lg text-text-primary">
            Recent Properties
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
                    {" "}
                    {/* Adjusted font size */}
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Agents (takes full width on mobile, 1/3 on desktop) */}
        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          {" "}
          {/* Adjusted padding */}
          <h2 className="mb-4 text-base font-semibold sm:text-lg text-text-primary">
            Top Agents
          </h2>
          <ul className="divide-y divide-gray-100">
            {topAgents.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-text-primary">{a.name}</div>
                  <div className="text-xs text-text-secondary">
                    {a.properties} listings
                  </div>
                </div>
                <div>
                  <button className="px-3 py-1 text-xs border rounded">
                    {" "}
                    {/* Adjusted font size */}
                    Profile
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

export default AdminDashboard;
