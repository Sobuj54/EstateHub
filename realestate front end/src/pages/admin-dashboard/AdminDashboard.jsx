import React, { useState } from "react";
import Icon from "components/AppIcon";
import useAdminDashboardData from "hooks/useDashboardSummary";
import { formatDate } from "utils/formatDate";
import PropertyDetailModal from "components/ui/PropertyDetailsModal";
import AgentProfileModal from "components/ui/AgentProfileModal";

// MOCK data (Used for structure reference and CSV export)
const MOCK = {
  stats: {
    totalAgents: 12,
    totalMembers: 50,
    totalProperties: 120,
    propertiesThisMonth: 8,
    newMembers: 5,
  },
};

const AdminDashboard = () => {
  const [mockMode, setMockMode] = useState(false);
  // 🔑 New state for modal content
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const {
    data: apiData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useAdminDashboardData(mockMode);

  // --- Data Mapping and Consolidation ---
  const dashboardData = apiData || {};

  const stats = {
    totalAgents: dashboardData.totalActiveAgents ?? MOCK.stats.totalAgents,
    totalMembers: dashboardData.totalMembers ?? MOCK.stats.totalMembers,
    totalProperties:
      dashboardData.totalProperties ?? MOCK.stats.totalProperties,
    newMembers: dashboardData.newMembersCount ?? MOCK.stats.newMembers,
    propertiesThisMonth:
      dashboardData.recentProperties?.length ?? MOCK.stats.propertiesThisMonth,
  };

  const recentProperties = dashboardData.recentProperties || [];
  const topAgents = dashboardData.topAgents || [];

  const showSkeleton = isLoading && !apiData && !mockMode;

  // --- Render Logic ---

  if (showSkeleton) {
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

  if (isError && !mockMode) {
    console.error("Dashboard data fetch failed:", error);
  }

  return (
    <div className="space-y-8">
      {/* Dev Banner + Mock Toggle */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold sm:text-3xl text-text-primary">
          Admin Dashboard
          {isFetching && (
            <span className="ml-3 text-sm font-light text-primary-500 animate-pulse">
              Refreshing...
            </span>
          )}
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

          {/* Export CSV Button (uses final 'stats' data) */}
          <button
            onClick={() => {
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

      {/* mock mode / error indicator */}
      {(mockMode || isError) && (
        <div className="flex items-center p-3 text-sm text-yellow-800 border border-yellow-100 rounded-md bg-yellow-50">
          <Icon name="Info" size={16} className="mr-2" />
          <div>
            <strong>{mockMode ? "Mock mode" : "Error fallback"}</strong> — Data
            shown is {mockMode ? "mock" : "from a fallback due to fetch error."}
          </div>
        </div>
      )}

      {/* stat cards (dynamic) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-secondary">Agents</h3>
          <p className="mt-2 text-xl font-bold sm:text-2xl text-text-primary">
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Recent Properties */}
        <div className="p-4 bg-white shadow sm:p-6 md:col-span-2 rounded-2xl">
          <h2 className="mb-4 text-base font-semibold sm:text-lg text-text-primary">
            Recent Properties
          </h2>
          <ul className="divide-y divide-gray-100">
            {recentProperties.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="font-medium text-text-primary">{p.title}</div>
                  <div className="text-xs text-text-secondary">
                    **{p.agent?.name || "N/A Agent"}** ·{" "}
                    {formatDate(p.createdAt)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedProperty(p)} // 🔑 Open Property Modal
                    className="px-3 py-1 text-xs text-white transition rounded bg-primary hover:bg-primary-600"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Agents */}
        <div className="p-4 bg-white shadow sm:p-6 rounded-2xl">
          <h2 className="mb-4 text-base font-semibold sm:text-lg text-text-primary">
            Top Agents
          </h2>
          <ul className="divide-y divide-gray-100">
            {topAgents.map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="font-medium text-text-primary">{a.name}</div>
                  <div className="text-xs text-text-secondary">
                    {a.propertiesCount} listings
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setSelectedAgent(a)} // 🔑 Open Agent Modal
                    className="px-3 py-1 text-xs transition border rounded hover:bg-gray-50"
                  >
                    Profile
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RENDER MODALS */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
      <AgentProfileModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
};

export default AdminDashboard;
