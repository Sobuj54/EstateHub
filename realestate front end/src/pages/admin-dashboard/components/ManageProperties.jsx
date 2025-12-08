// src/components/admin/ManageProperties.jsx
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";
import useDebounce from "hooks/useDebounce";
import { toast } from "react-toastify";
import ConfirmModal from "components/ui/ConfirmModal";
import PropertyPreviewModal from "components/ui/PropertyPreivewModal";
import Pagination from "components/ui/Pagination";

const ManageProperties = () => {
  const api = useAxiosSecure();
  const queryClient = useQueryClient();

  // Local UI state
  const [selected, setSelected] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 600);

  // Query key used for fetching and cache updates
  const queryKey = ["pending-properties", limit, page, debouncedSearch];

  // Fetch properties (server expects: limit, pageNo, query)
  const {
    data,
    isLoading,
    isError,
    refetch: refetchProperties,
  } = useQuery({
    queryKey,
    queryFn: async ({ queryKey }) => {
      const [, qLimit, qPage, qSearch] = queryKey;
      const res = await api.get("/properties", {
        params: { limit: qLimit, pageNo: qPage, query: qSearch },
      });

      const payload = res?.data?.data || {};
      return {
        properties: payload.properties ?? [],
        totalPages: payload.totalPage ?? 1, // <--- map correctly
        currentPage: payload.currentPage ?? qPage, // <--- map correctly
      };
    },
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const properties = data?.properties ?? [];
  const totalPages = data?.totalPages ?? 1; // now uses totalPage from server
  const currentPageFromServer = data?.currentPage ?? page;

  // reset page when search or limit change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  // Optimistic verify
  const optimisticVerify = async (id) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData({ queryKey });

    queryClient.setQueryData({ queryKey }, (old) => {
      if (!old) return old;
      return {
        ...old,
        properties: old.properties.map((p) =>
          p._id === id ? { ...p, isApproved: true } : p
        ),
      };
    });

    return { previous };
  };

  const verifyMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/properties/verify/${id}`);
      return res.data;
    },
    onMutate: (id) => optimisticVerify(id),
    onError: (err, id, context) => {
      toast.error("Failed to verify property. Rolling back.");
      if (context?.previous) {
        queryClient.setQueryData({ queryKey }, context.previous);
      }
    },
    onSuccess: () => {
      toast.success("Property verified");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Optimistic delete
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/properties/${id}`);
      return res.data;
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData({ queryKey });

      queryClient.setQueryData({ queryKey }, (old) => {
        if (!old) return old;
        return {
          ...old,
          properties: old.properties.filter((p) => p._id !== idToDelete),
          totalCount: (old.totalCount ?? 0) - 1,
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      toast.error("Failed to delete property. Rolling back.");
      if (context?.previous) {
        queryClient.setQueryData({ queryKey }, context.previous);
      }
    },
    onSuccess: async () => {
      toast.success("Property deleted");
      const cur = queryClient.getQueryData({ queryKey });
      const propsNow = cur?.properties ?? [];
      if (propsNow.length === 0 && page > 1) {
        setPage((p) => p - 1);
      }
      await queryClient.invalidateQueries({ queryKey });
      refetchProperties();
    },
  });

  // UI handlers
  const handleVerify = (id) => verifyMutation.mutate(id);
  const handleRejectConfirm = () => {
    if (confirmReject?._id) {
      rejectMutation.mutate(confirmReject._id);
      setConfirmReject(null);
    }
  };

  // If server returns currentPage, sync local page (within bounds)
  useEffect(() => {
    if (
      typeof currentPageFromServer === "number" &&
      currentPageFromServer !== page
    ) {
      if (currentPageFromServer >= 1 && currentPageFromServer <= totalPages) {
        setPage(currentPageFromServer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageFromServer, totalPages]);

  if (isLoading)
    return (
      <div className="grid gap-4">
        {[...Array(limit)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-4 bg-white shadow rounded-2xl sm:flex-row sm:items-center sm:justify-between animate-pulse"
          >
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-5 bg-gray-300 rounded"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
            </div>

            <div className="flex flex-col gap-2 mt-3 sm:flex-row sm:items-center sm:gap-3 sm:mt-0">
              <div className="w-20 h-8 bg-gray-300 rounded"></div>
              <div className="w-20 h-8 bg-gray-300 rounded"></div>
              <div className="w-20 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );

  if (isError)
    return <div className="p-4 text-red-500">Failed to load properties</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">
          Manage Properties
        </h1>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location"
            className="px-3 py-2 border rounded-lg"
          />

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-5 py-2 border rounded-lg"
            aria-label="Items per page"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>

          <button
            onClick={() => refetchProperties()}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {properties.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            No pending properties.
          </div>
        ) : (
          properties.map((property) => (
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
                  {property.isApproved ? "Verified" : "Pending"}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                {!property.isApproved && (
                  <button
                    onClick={() => handleVerify(property._id)}
                    className="w-full px-3 py-1 text-white rounded sm:w-auto bg-success disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={verifyMutation.isLoading}
                  >
                    {verifyMutation.isLoading ? "Working..." : "Approve"}
                  </button>
                )}

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
        title={`Delete ${confirmReject?.title}?`}
        description="Are you sure you want to permanently delete this property?"
        onCancel={() => setConfirmReject(null)}
        onConfirm={handleRejectConfirm}
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
