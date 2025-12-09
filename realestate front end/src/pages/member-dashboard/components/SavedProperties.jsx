// src/pages/member-dashboard/components/SavedProperties.jsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";
import Pagination from "components/ui/Pagination";
import ConfirmModal from "components/ui/ConfirmModal";
import { toast } from "react-toastify";
import Icon from "../../../components/AppIcon";

const DefaultLimit = 6;

const SkeletonGrid = ({ count = 3 }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="h-64 bg-secondary-100 animate-pulse rounded-2xl"
      />
    ))}
  </div>
);

const transformSavedItem = (item) => {
  const p = item.propertyId || {};
  return {
    savedId: item._id,
    id: p._id,
    title: p.title,
    price: p.price,
    location: p.address,
    agent: p.agent?.name || "—",
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    image: (p.images && p.images[0]) || "/assets/images/no_image.png",
  };
};

const SavedProperties = () => {
  const api = useAxiosSecure();
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DefaultLimit);

  // Modal state
  const [toDelete, setToDelete] = useState(null); // holds savedId to delete

  const queryKey = ["member-saved-properties", page, limit];

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get("/saved-properties", {
        params: { limit, pageNo: page },
      });
      const payload = res?.data?.data ?? {};
      return {
        savedProperties: payload.savedProperties ?? [],
        totalPages: payload.totalPages ?? 1,
        currentPage: payload.currentPage ?? page,
        totalCount: payload.totalCount ?? 0,
      };
    },
    keepPreviousData: true,
    staleTime: 1000 * 30,
    retry: 1,
  });

  const savedProperties = data?.savedProperties ?? [];
  const totalPages = data?.totalPages ?? 1;

  const items = useMemo(
    () => savedProperties.map(transformSavedItem),
    [savedProperties]
  );

  // DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: async (savedId) => {
      const res = await api.delete(`/saved-properties/${savedId}`);
      return res.data;
    },
    onMutate: async (savedId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          savedProperties: old.savedProperties.filter((s) => s._id !== savedId),
          totalCount: Math.max(0, (old.totalCount ?? 1) - 1),
        };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete saved property"
      );
      if (context?.previous)
        queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: () => {
      toast.success("Removed saved property");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleDeleteClick = (savedId) => setToDelete(savedId);
  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete);
    setToDelete(null);
  };
  const handleCancelDelete = () => setToDelete(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          Saved Properties
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Per page</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-1 border rounded"
          >
            {[6, 12, 24].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <SkeletonGrid count={Math.min(3, limit)} />}

      {isError && (
        <div className="p-6 text-center text-red-600">
          Failed to load saved properties. Please try again.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="py-8 text-center">
          <Icon
            name="Heart"
            size={48}
            className="mx-auto mb-4 text-secondary-300"
          />
          <h3 className="mb-2 text-lg font-medium text-text-primary">
            No Saved Properties
          </h3>
          <p className="text-text-secondary">
            Start browsing properties and save favorites to see them here.
          </p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.savedId}
                className="flex flex-col overflow-hidden bg-white shadow rounded-2xl"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="object-cover w-full h-48"
                />
                <div className="flex flex-col gap-2 p-4">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {p.title}
                  </h2>
                  <p className="text-sm text-text-secondary">{p.location}</p>
                  <p className="font-bold text-primary">
                    {typeof p.price === "number"
                      ? `$${p.price.toLocaleString()}`
                      : p.price}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Agent: {p.agent}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {p.bedrooms} Bed · {p.bathrooms} Bath
                  </p>
                  <button
                    onClick={() => handleDeleteClick(p.savedId)}
                    title="Remove saved"
                    className="px-3 py-2 mt-4 text-sm text-white rounded bg-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-6">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>

          {isFetching && (
            <div className="mt-2 text-xs text-center text-text-secondary">
              Updating…
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Remove saved property"
        description="Are you sure you want to remove this property from your saved list? This action can be undone by saving the property again."
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SavedProperties;
