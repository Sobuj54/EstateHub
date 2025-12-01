import React, { useEffect, useState } from "react";

const ManageAgents = () => {
  const [agents, setAgents] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // TODO: Fetch agents from backend
    setTimeout(() => {
      setAgents([
        {
          id: 1,
          name: "John Smith",
          email: "john@example.com",
          status: "Active",
        },
        {
          id: 2,
          name: "Jane Doe",
          email: "jane@example.com",
          status: "Inactive",
        },
        {
          id: 3,
          name: "Michael Brown",
          email: "michael@example.com",
          status: "Active",
        },
      ]);
    }, 1000);
  }, []);

  const handleStatusToggle = (id) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" }
          : a
      )
    );
    // TODO: Call backend API to update status
    console.log(`Toggled status for agent ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      setAgents((prev) => prev.filter((a) => a.id !== id));
      // TODO: Call backend API to delete agent
      console.log(`Deleted agent ${id}`);
    }
  };

  const filteredAgents =
    agents?.filter(
      (a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (!agents) {
    return (
      <div className="space-y-4">
        <div className="w-1/4 h-6 rounded bg-secondary-100 animate-pulse"></div>
        <div className="mt-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded bg-secondary-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Manage Agents</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded sm:w-1/3"
      />

      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAgents.map((agent) => (
              <tr key={agent.id}>
                <td className="px-6 py-4 whitespace-nowrap">{agent.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agent.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      agent.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    } cursor-pointer`}
                    onClick={() => handleStatusToggle(agent.id)}
                  >
                    {agent.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="px-3 py-1 text-sm text-white transition rounded bg-error hover:bg-error-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredAgents.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-text-secondary"
                >
                  No agents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAgents;
