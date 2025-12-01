import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [topAgents, setTopAgents] = useState([]);

  useEffect(() => {
    // TODO: Fetch dashboard data from backend
    setTimeout(() => {
      setStats({
        totalAgents: 12,
        totalMembers: 50,
        totalProperties: 120,
        propertiesThisMonth: 8,
        newMembers: 5,
      });
      setRecentProperties([
        { id: 1, title: "Luxury Villa", agent: "John Smith" },
        { id: 2, title: "Modern Apartment", agent: "Jane Doe" },
      ]);
      setTopAgents([
        { id: 1, name: "John Smith", properties: 20 },
        { id: 2, name: "Jane Doe", properties: 15 },
      ]);
    }, 1000);
  }, []);

  if (!stats) {
    // Loading skeleton
    return (
      <div className="space-y-6">
        {" "}
        <div className="w-1/3 h-8 rounded bg-secondary-100 animate-pulse"></div>{" "}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-secondary-100 animate-pulse"
            />
          ))}{" "}
        </div>{" "}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {" "}
      <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="font-medium text-text-secondary">Agents</h3>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {stats.totalAgents}
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="font-medium text-text-secondary">Members</h3>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {stats.totalMembers}
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="font-medium text-text-secondary">Properties</h3>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {stats.totalProperties}
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="font-medium text-text-secondary">
            New Properties (This Month)
          </h3>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {stats.propertiesThisMonth}
          </p>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button className="px-6 py-3 font-medium text-white transition bg-primary rounded-2xl hover:bg-primary-700">
          Add New Property
        </button>
        <button className="px-6 py-3 font-medium text-white transition bg-primary rounded-2xl hover:bg-primary-700">
          Add New Agent
        </button>
        <button className="px-6 py-3 font-medium text-white transition bg-primary rounded-2xl hover:bg-primary-700">
          Add New Member
        </button>
      </div>
      {/* Recent Properties */}
      <div className="p-6 bg-white shadow rounded-2xl">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Recent Properties
        </h2>
        <ul className="divide-y divide-gray-200">
          {recentProperties.map((prop) => (
            <li key={prop.id} className="flex justify-between py-3">
              <span>{prop.title}</span>
              <span className="text-text-secondary">{prop.agent}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Top Agents */}
      <div className="p-6 bg-white shadow rounded-2xl">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Top Agents
        </h2>
        <ul className="divide-y divide-gray-200">
          {topAgents.map((agent) => (
            <li key={agent.id} className="flex justify-between py-3">
              <span>{agent.name}</span>
              <span className="text-text-secondary">
                {agent.properties} properties
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
