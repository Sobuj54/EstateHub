// src/pages/admin-dashboard/components/ManageMembers.jsx
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";
import ConfirmModal from "components/ui/ConfirmModal";
import Pagination from "components/ui/Pagination";

const roles = [
  { value: "member", label: "Member" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const transformMemberData = (apiData) =>
  apiData.map((m) => ({
    id: m._id,
    name: m.name,
    email: m.email,
    role: m.role,
    status: "active",
    isVerified: !!m.isVerified,
    avatar: m.avatar,
    createdAt: m.createdAt,
  }));

const ManageMembers = () => {
  const api = useAxiosSecure();
  const queryClient = useQueryClient();

  // Pagination & search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState("");

  // UI state
  const [selectedDelete, setSelectedDelete] = useState(null);

  // ------- Fetch members with pagination & search -------
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["members", page, limit, q],
    queryFn: async () => {
      const res = await api.get("/users/members", {
        params: { page, limit, q },
      });
      const users = res?.data?.data?.users ?? [];
      const totalPages = res?.data?.data?.totalPages ?? 1;
      const currentPage = res?.data?.data?.currentPage ?? page;
      const totalCount = res?.data?.data?.totalCount ?? 0;

      return {
        members: transformMemberData(users),
        totalPages,
        currentPage,
        totalCount,
      };
    },
    keepPreviousData: true,
    staleTime: 1000 * 30,
    retry: 1,
  });

  const members = data?.members ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? page;
  const totalCount = data?.totalCount ?? 0;

  // Helper: optimistic update
  const optimisticUpdate = async ({ id, patch }) => {
    await queryClient.cancelQueries({ queryKey: ["members", page, limit, q] });
    const previous = queryClient.getQueryData({
      queryKey: ["members", page, limit, q],
    });
    queryClient.setQueryData(
      { queryKey: ["members", page, limit, q] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          members: old.members.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        };
      }
    );
    return { previous };
  };

  const handleErrorRollback = (context) => {
    if (context?.previous) {
      queryClient.setQueryData(
        { queryKey: ["members", page, limit, q] },
        context.previous
      );
    }
    toast.error("Operation failed — rolled back.");
  };

  // ------- Role mutation -------
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) =>
      api.patch(`/users/change-role/${id}`, { role }),
    onMutate: (vars) =>
      optimisticUpdate({ id: vars.id, patch: { role: vars.role } }),
    onError: (err, vars, context) => handleErrorRollback(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    onSuccess: () => toast.success("Role updated"),
  });

  const handleRoleChange = (id, nextRole) => {
    roleMutation.mutate({ id, role: nextRole });
  };

  // ------- Verify mutation -------
  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }) =>
      api.patch(`/users/verify/${id}`, { isVerified }),
    onMutate: (vars) =>
      optimisticUpdate({ id: vars.id, patch: { isVerified: vars.isVerified } }),
    onError: (err, vars, context) => handleErrorRollback(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    onSuccess: () => toast.success("Verification status updated"),
  });

  const handleVerificationChange = (id, isVerified) => {
    verifyMutation.mutate({ id, isVerified });
  };

  // ------- Delete mutation -------
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: ["members", page, limit, q],
      });
      const previous = queryClient.getQueryData({
        queryKey: ["members", page, limit, q],
      });
      queryClient.setQueryData(
        { queryKey: ["members", page, limit, q] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            members: old.members.filter((m) => m.id !== idToDelete),
          };
        }
      );
      return { previous };
    },
    onError: (err, variables, context) => handleErrorRollback(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    onSuccess: () => toast.success("Member deleted"),
  });

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
    setSelectedDelete(null);
  };

  // When changing page/limit/search, reset page and close delete modal if open
  const onPageChange = (p) => {
    setPage(p);
    setSelectedDelete(null);
  };

  // Responsive helpers
  const isBusy =
    isFetching ||
    roleMutation.isPending ||
    verifyMutation.isPending ||
    deleteMutation.isPending;

  // UI Loading / Error
  if (isLoading) {
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

  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Failed to load members. Check the network.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirm Modal */}
      <ConfirmModal
        open={!!selectedDelete}
        title="Delete member"
        description={`Are you sure you want to delete ${selectedDelete?.name}? This action cannot be undone.`}
        onCancel={() => setSelectedDelete(null)}
        onConfirm={() => handleDelete(selectedDelete.id)}
      />

      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Manage Members</h1>

        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:gap-3 sm:w-auto">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="flex-1 min-w-0 px-3 py-2 border rounded-md bg-background"
          />

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md bg-background"
            aria-label="Items per page"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="hidden min-w-full divide-y divide-gray-200 sm:table">
          <thead className="bg-gray-50">
            <tr>
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
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Verified
              </th>
              <th className="px-6 py-3 text-xs font-medium text-right uppercase text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        member.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name || "U"
                        )}`
                      }
                      alt={member.name}
                      className="object-cover rounded-full w-9 h-9"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name || "U"
                        )}`;
                      }}
                    />
                    <div>
                      <div className="font-medium text-text-primary">
                        {member.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                    className="px-2 py-1 border rounded"
                    disabled={roleMutation.isPending || isBusy}
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
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={member.isVerified}
                    onChange={(e) =>
                      handleVerificationChange(member.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded form-checkbox text-primary"
                    disabled={verifyMutation.isPending || isBusy}
                    aria-label={`Toggle verified for ${member.name}`}
                  />
                </td>

                <td className="px-6 py-4 space-x-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => setSelectedDelete(member)}
                    className="px-3 py-1 text-white rounded bg-error"
                    disabled={deleteMutation.isPending || isBusy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {members.length === 0 && (
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
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-2 p-4 bg-white shadow rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 gap-3">
                  <img
                    src={
                      member.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name || "U"
                      )}`
                    }
                    alt={member.name}
                    className="object-cover w-12 h-12 rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name || "U"
                      )}`;
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate text-text-primary">
                      {member.name}
                    </div>
                    <div className="text-xs truncate text-text-secondary">
                      {member.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1 text-sm border rounded"
                  disabled={roleMutation.isPending || isBusy}
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
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {member.status}
                </span>

                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={member.isVerified}
                    onChange={(e) =>
                      handleVerificationChange(member.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded form-checkbox text-primary"
                    disabled={verifyMutation.isPending || isBusy}
                  />
                  <span>Verified</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedDelete(member)}
                  className="px-3 py-1 text-white rounded bg-error"
                  disabled={deleteMutation.isPending || isBusy}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {totalCount === 0 && (
            <div className="py-6 text-center text-gray-500">
              No members found.
            </div>
          )}
        </div>
      </div>

      {/* Footer: pagination controls */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm text-text-secondary">
          Page {currentPage} of {totalPages}{" "}
          {isFetching && <span className="ml-2 text-xs">Updating…</span>}
        </div>

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          setPage={onPageChange}
        />
      </div>
    </div>
  );
};

export default ManageMembers;
