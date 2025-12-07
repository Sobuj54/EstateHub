// src/components/admin/ManageAgents.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "components/ui/ConfirmModal";
import Pagination from "components/ui/Pagination";
import useAgents from "hooks/useAgents";
import useAxiosSecure from "hooks/useAxiosSecure";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

const ManageAgents = () => {
  const api = useAxiosSecure();
  const queryClient = useQueryClient();

  // State for pagination and search
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);

  // --- QUERY KEY DEFINITION ---
  // This key MUST match the key used in your useAgents hook for optimistic updates to work.
  const queryKey = ["agents", { pageNo, limit, query }];

  // Fetch data using the custom hook
  const { data, isLoading, isFetching, isPreviousData, isError } = useAgents(
    pageNo,
    limit,
    query
  );
  const agents = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  // --- OPTIMISTIC UPDATE HELPER ---
  const optimisticUpdate = async (id, fields) => {
    await queryClient.cancelQueries({ queryKey });

    const previousAgentsData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        users: old.users.map((a) => (a._id === id ? { ...a, ...fields } : a)),
      };
    });

    return { previousAgentsData };
  };

  const handleMutationError = (context) => {
    toast.error("An error occurred. Rolling back changes.");
    queryClient.setQueryData(queryKey, context.previousAgentsData);
  };

  // 1. Toggle Verification Status
  const toggleVerificationMutation = useMutation({
    mutationFn: ({ id, isVerified }) =>
      api.patch(`/users/verify/${id}`, { isVerified }),

    onMutate: ({ id, isVerified }) => optimisticUpdate(id, { isVerified }),
    onError: (err, variables, context) => handleMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
    onSuccess: () => toast.success("Verification status updated successfully."),
  });

  // 2. Change Role (Handles 'member', 'agent', 'admin')
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, newRole }) =>
      api.patch(`/users/change-role/${id}`, { role: newRole }),

    onMutate: ({ id, newRole }) => optimisticUpdate(id, { role: newRole }),
    onError: (err, variables, context) => handleMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
    onSuccess: (data, { newRole }) => {
      toast.success(`Role updated to ${newRole.toUpperCase()}.`);
    },
  });

  // 3. Delete Agent
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),

    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey });
      const previousAgentsData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter((a) => a._id !== idToDelete),
        };
      });
      return { previousAgentsData };
    },

    onSuccess: () => {
      toast.success("Agent deleted successfully.");
      setToDelete(null);
    },
    onError: (err, variables, context) => {
      toast.error("Failed to delete agent. Rolling back.");
      queryClient.setQueryData(queryKey, context.previousAgentsData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleDeleteConfirm = () => {
    if (toDelete) {
      deleteMutation.mutate(toDelete._id);
    }
  };

  // --- COLUMN DEFINITIONS ---
  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      // Verification Status Column
      {
        accessorKey: "isVerified",
        header: "Verified",
        cell: ({ agent }) => {
          const isVerified = agent.isVerified;
          const isPending =
            toggleVerificationMutation.isPending &&
            toggleVerificationMutation.variables?.id === agent._id;

          return (
            <button
              onClick={() =>
                toggleVerificationMutation.mutate({
                  id: agent._id,
                  isVerified: !isVerified,
                })
              }
              className={`px-3 py-1 text-sm rounded transition-colors shadow-sm ${
                isVerified
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
              disabled={isPending}
            >
              {isPending
                ? "Updating..."
                : isVerified
                ? "Verified"
                : "Unverified"}
            </button>
          );
        },
      },
      // Role Change Column
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ agent }) => {
          const currentRole = agent.role;
          const isUpdating =
            changeRoleMutation.isPending &&
            changeRoleMutation.variables?.id === agent._id;

          const roles = ["member", "agent", "admin"];

          const handleSelectChange = (e) => {
            const newRole = e.target.value;
            if (newRole !== currentRole) {
              changeRoleMutation.mutate({ id: agent._id, newRole });
            }
          };

          let roleColorClass;
          if (currentRole === "admin") {
            roleColorClass =
              "bg-red-100 text-red-700 border-red-300 hover:bg-red-200";
          } else if (currentRole === "agent") {
            roleColorClass =
              "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200";
          } else {
            roleColorClass =
              "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200";
          }

          return (
            <div className="relative">
              <select
                value={currentRole}
                onChange={handleSelectChange}
                disabled={isUpdating}
                className={`py-1.5 pl-3 pr-8 text-sm font-medium rounded-lg appearance-none cursor-pointer transition-colors shadow-sm focus:ring-blue-500 focus:border-blue-500 border w-28 ${roleColorClass}`}
              >
                {isUpdating ? (
                  <option value={currentRole}>Updating...</option>
                ) : (
                  roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))
                )}
              </select>
              {!isUpdating && (
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                  <svg
                    className="w-4 h-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15 10l-4.293-4.293-.707.707L12.586 9H5v2h7.586l-3.293 3.293z" />
                  </svg>
                </div>
              )}
            </div>
          );
        },
      },
      // Actions Column (Delete)
      {
        id: "actions",
        header: "",
        cell: ({ agent }) => {
          return (
            <button
              onClick={() => setToDelete(agent)}
              className="px-3 py-1 text-sm text-white transition bg-red-600 rounded shadow-md hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              Delete
            </button>
          );
        },
      },
    ],
    [toggleVerificationMutation, changeRoleMutation, deleteMutation]
  );

  // Custom Cell Renderer function
  const renderCell = (agent, column) => {
    if (column.cell) {
      return column.cell({ agent });
    }
    return agent[column.accessorKey];
  };

  // --- RENDER LOGIC ---
  if (isLoading && !isPreviousData) {
    return (
      <div className="p-6 space-y-4 rounded-xl bg-gray-50">
        <div className="w-64 h-8 bg-gray-200 rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-700 bg-red-100 border border-red-300 shadow-md rounded-xl">
        Error loading agents. Please check the API connectivity.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 font-sans md:p-8 bg-gray-50">
      {/* Header and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Agent Management ({totalCount})
          {isFetching && (
            <span className="ml-3 text-sm text-blue-500 animate-pulse">
              (Loading...)
            </span>
          )}
        </h1>
        <div className="flex flex-col w-full gap-2 sm:w-80">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPageNo(1); // Reset to page 1 on search
            }}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 transition border border-gray-300 shadow-sm rounded-xl focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table & Cards */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">
        {/* Desktop table */}
        <table className="hidden min-w-full divide-y divide-gray-200 sm:table">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessorKey || column.id}
                  className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <tr key={agent._id} className="transition hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.accessorKey || column.id}
                    className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"
                  >
                    {renderCell(agent, column)}
                  </td>
                ))}
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-gray-500"
                >
                  No agents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="p-4 space-y-4 sm:hidden">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="flex flex-col gap-3 p-4 bg-white border border-gray-100 shadow-lg rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-900 truncate">
                  {agent.name}
                </div>
                {/* Actions column on mobile */}
                {renderCell(
                  agent,
                  columns.find((c) => c.id === "actions")
                )}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {agent.email}
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Role Change */}
                {renderCell(
                  agent,
                  columns.find((c) => c.accessorKey === "role")
                )}
                {/* Verification */}
                {renderCell(
                  agent,
                  columns.find((c) => c.accessorKey === "isVerified")
                )}
              </div>
            </div>
          ))}
          {agents.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No agents found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm font-medium text-gray-600">
          Showing {agents.length} of {totalCount} total agents.
        </span>

        <Pagination page={pageNo} totalPages={totalPages} setPage={setPageNo} />
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete Agent Confirmation"
        description={`Are you sure you want to permanently delete agent ${toDelete?.name} (${toDelete?.email})? This action cannot be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ManageAgents;
