// src/components/admin/ManageProperties.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";
import { toast } from "react-toastify";
import ConfirmModal from "components/ui/ConfirmModal";
import PropertyPreviewModal from "components/ui/PropertyPreivewModal";
import Pagination from "components/ui/Pagination";

const ManageProperties = () => {
  const api = useAxiosSecure();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [page, setPage] = useState(1); // current page state

  const limit = 10;

  // Fetch properties with pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pending-properties", limit, page],
    queryFn: async () => {
      const res = await api.get(`/properties?limit=${limit}&PageNo=${page}`);
      return res.data.data.properties;
    },
    keepPreviousData: true,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      await api.patch(`/properties/${id}`, { isApproved: true });
      return id;
    },
    onSuccess: (id) => {
      toast.success("Property approved");
      queryClient.setQueryData(["pending-properties", limit, page], (old) =>
        old?.filter((p) => p._id !== id)
      );
    },
    onError: () => {
      toast.error("Failed to approve property");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/properties/${id}`, { isApproved: false });
      return id;
    },
    onSuccess: (id) => {
      toast.success("Property Deleted");
      queryClient.setQueryData(["pending-properties", limit, page], (old) =>
        old?.filter((p) => p._id !== id)
      );
    },
    onError: () => {
      toast.error("Failed to Delete property");
    },
  });

  if (isLoading) return <div className="p-4">Loading properties...</div>;
  if (isError)
    return <div className="p-4 text-red-500">Failed to load properties</div>;

  const totalPages = Math.ceil(data?.length / limit) || 1; // You can fetch total count from API for accuracy

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">
          Manage Properties
        </h1>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          Retry
        </button>
      </div>

      <div className="grid gap-4">
        {data.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            No pending properties.
          </div>
        ) : (
          data.map((property) => (
            <div
              key={property._id}
              className="flex flex-col gap-3 p-4 bg-white shadow rounded-2xl sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium text-text-primary">
                  {property.title}
                </div>
                <div className="text-xs text-text-secondary">
                  By {property.agent?.name} ·{" "}
                  {property.isApproved ? "Approved" : "Pending"}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  onClick={() => approveMutation.mutate(property._id)}
                  className="w-full px-3 py-1 text-white rounded sm:w-auto bg-success disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={approveMutation.isLoading}
                >
                  {approveMutation.isLoading ? "Working..." : "Approve"}
                </button>

                <button
                  onClick={() => setSelected(property)}
                  className="w-full px-3 py-1 border rounded sm:w-auto"
                >
                  Preview
                </button>

                <button
                  onClick={() => setConfirmReject(property)}
                  className="w-full px-3 py-1 text-white rounded sm:w-auto bg-error disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Reject confirmation modal */}
      <ConfirmModal
        open={!!confirmReject}
        title={`Reject ${confirmReject?.title}?`}
        description="Are you sure you want to reject this property?"
        onCancel={() => setConfirmReject(null)}
        onConfirm={() => {
          if (confirmReject?._id) rejectMutation.mutate(confirmReject._id);
          setConfirmReject(null);
        }}
      />

      {/* Property preview modal */}
      <PropertyPreviewModal
        open={!!selected}
        property={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default ManageProperties;
