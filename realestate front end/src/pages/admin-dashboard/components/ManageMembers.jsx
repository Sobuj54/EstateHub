import React, { useEffect, useState } from "react";

const ManageMembers = () => {
  const [members, setMembers] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO: Fetch members from backend
    setTimeout(() => {
      setMembers([
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "member",
        },
        {
          id: 2,
          name: "Bob Williams",
          email: "bob@example.com",
          role: "agent",
        },
        {
          id: 3,
          name: "Charlie Brown",
          email: "charlie@example.com",
          role: "member",
        },
      ]);
    }, 1000);
  }, []);

  const handleRoleChange = (id, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
    console.log(`Updated member ${id} role to ${newRole}`);
    // TODO: Call backend API to update role
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      console.log(`Deleted member ${id}`);
      // TODO: Call backend API to delete member
    }
  };

  if (!members) {
    return (
      <div className="space-y-4">
        <div className="w-1/4 h-6 rounded bg-secondary-100 animate-pulse"></div>
        <div className="mt-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded bg-secondary-100 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Manage Members</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-1/2 p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value="member">Member</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 space-x-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="px-3 py-1 text-sm text-white transition rounded bg-error hover:bg-error-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-text-secondary"
                >
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMembers;
