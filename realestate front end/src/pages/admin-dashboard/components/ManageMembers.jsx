import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useAxiosSecure from "hooks/useAxiosSecure";
import ConfirmModal from "components/ui/ConfirmModal";

const roles = [
  { value: "member", label: "Member" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const MOCK_MEMBERS = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "member",
    status: "active",
  },
  {
    id: 2,
    name: "Bob Williams",
    email: "bob@example.com",
    role: "agent",
    status: "active",
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "member",
    status: "inactive",
  },
];

const ManageMembers = () => {
  const api = useAxiosSecure();
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [selectedBulk, setSelectedBulk] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch members
  useEffect(() => {
    let mounted = true;
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/users?role=member");
        const data = res?.data?.data || MOCK_MEMBERS;
        if (!mounted) return;
        setMembers(data);
      } catch (err) {
        console.warn("Failed to fetch members, using mock data.", err);
        if (!mounted) return;
        setMembers(MOCK_MEMBERS);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchMembers();
    return () => (mounted = false);
  }, [api]);

  // Filter members by query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q)
    );
  }, [members, query]);

  // Role change handler
  const handleRoleChange = async (id, nextRole) => {
    const oldRole = members.find((m) => m.id === id)?.role;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: nextRole } : m))
    );
    try {
      await api.patch(`/admin/users/${id}`, { role: nextRole });
      toast.success("Role updated");
    } catch (err) {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role: oldRole } : m))
      );
      toast.error("Failed to update role");
    }
  };

  // Single delete handler
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setSelectedDelete(null);
      toast.success("Member deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Bulk selection toggle
  const toggleBulk = (id) => {
    setSelectedBulk((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk delete handler
  const bulkDelete = async () => {
    if (!selectedBulk.length) return toast.info("Select at least one user");
    if (
      !window.confirm(
        `Delete ${selectedBulk.length} users? This cannot be undone.`
      )
    )
      return;
    try {
      await api.post("/admin/users/bulk-delete", { ids: selectedBulk });
      setMembers((prev) => prev.filter((m) => !selectedBulk.includes(m.id)));
      setSelectedBulk([]);
      toast.success("Deleted selected users");
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-64 h-8 rounded bg-secondary-100 animate-pulse" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded bg-secondary-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Manage Members</h1>

        {/* Responsive controls */}
        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:gap-3 sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 min-w-0 px-3 py-2 border rounded-md bg-background"
          />
          <button
            onClick={bulkDelete}
            className="flex-shrink-0 px-4 py-2 text-white rounded-md bg-error"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Desktop table */}
        <table className="hidden min-w-full divide-y divide-gray-200 sm:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedBulk(
                      e.target.checked ? members.map((m) => m.id) : []
                    )
                  }
                  checked={
                    selectedBulk.length === members.length && members.length > 0
                  }
                />
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium text-right uppercase text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((member) => (
              <tr key={member.id}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedBulk.includes(member.id)}
                    onChange={() => toggleBulk(member.id)}
                  />
                </td>
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
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      member.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => setSelectedDelete(member)}
                    className="px-3 py-1 text-white rounded bg-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile card view */}
        <div className="space-y-4 sm:hidden">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-2 p-4 bg-white shadow rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium truncate text-text-primary">
                  {member.name}
                </div>
                <input
                  type="checkbox"
                  checked={selectedBulk.includes(member.id)}
                  onChange={() => toggleBulk(member.id)}
                />
              </div>
              <div className="text-xs truncate text-text-secondary">
                {member.email}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1 text-sm border rounded"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    member.status === "active"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedDelete(member)}
                  className="px-3 py-1 text-white rounded bg-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;
