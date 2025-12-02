import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import ConfirmModal from "components/ui/ConfirmModal";
import useAxiosSecure from "hooks/useAxiosSecure";
import { toast } from "react-toastify";

const MOCK_AGENTS = [
  { id: 1, name: "John Smith", email: "john@example.com", status: "Active" },
  { id: 2, name: "Jane Doe", email: "jane@example.com", status: "Inactive" },
  { id: 3, name: "Alice Brown", email: "alice@example.com", status: "Active" },
];

const ManageAgents = () => {
  const api = useAxiosSecure();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchAgents = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/agents");
        const data = res?.data?.data;
        if (!mounted) return;
        setAgents(Array.isArray(data) && data.length ? data : MOCK_AGENTS);
      } catch (err) {
        console.warn("Failed to fetch agents, using mock data.", err);
        if (!mounted) return;
        setAgents(MOCK_AGENTS);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchAgents();
    return () => (mounted = false);
  }, [api]);

  const toggleStatus = async (id) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" }
          : a
      )
    );
    try {
      await api.patch(`/admin/agents/${id}/status`, {});
      toast.success("Agent status updated");
    } catch (err) {
      toast.info("Updated locally (API unreachable).");
    }
  };

  const deleteAgent = async (id) => {
    try {
      await api.delete(`/admin/agents/${id}`);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      setToDelete(null);
      toast.success("Agent deleted");
    } catch (err) {
      setAgents((prev) => prev.filter((a) => a.id !== id));
      setToDelete(null);
      toast.info("Agent deleted locally (API unreachable).");
    }
  };

  const filteredAgents = useMemo(() => {
    if (!query.trim()) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.email.toLowerCase().includes(query.toLowerCase())
    );
  }, [agents, query]);

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const agent = row.original;
          return (
            <button
              onClick={() => toggleStatus(agent.id)}
              className={`px-3 py-1 rounded ${
                agent.status === "Active"
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              {agent.status}
            </button>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const agent = row.original;
          return (
            <button
              onClick={() => setToDelete(agent)}
              className="px-3 py-1 text-sm text-white rounded bg-error"
            >
              Delete
            </button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredAgents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-64 h-8 rounded bg-secondary-100 animate-pulse" />
        {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-text-primary">Manage Agents</h1>
        <div className="flex flex-col w-full gap-2 sm:w-auto sm:gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 min-w-0 px-3 py-2 border rounded-md bg-background"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        {/* Desktop table */}
        <table className="hidden min-w-full sm:table">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="p-4 space-y-4 sm:hidden">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col gap-2 p-4 bg-white shadow rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium truncate text-text-primary">
                  {agent.name}
                </div>
              </div>
              <div className="text-xs truncate text-text-secondary">
                {agent.email}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={() => toggleStatus(agent.id)}
                  className={`px-3 py-1 rounded ${
                    agent.status === "Active"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {agent.status}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setToDelete(agent)}
                  className="px-3 py-1 text-white rounded bg-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredAgents.length === 0 && (
            <div className="py-6 text-center text-gray-500">
              No agents found.
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete agent"
        description={`Are you sure you want to delete ${toDelete?.name}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => deleteAgent(toDelete.id)}
      />
    </div>
  );
};

export default ManageAgents;
