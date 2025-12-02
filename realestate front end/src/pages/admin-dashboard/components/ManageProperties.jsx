// src/components/admin/ManageProperties.jsx
import ConfirmModal from "components/ui/ConfirmModal";
import useAxiosSecure from "hooks/useAxiosSecure";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

/**
 * ManageProperties
 *
 * - Attempts to load pending properties via api.get('/admin/properties?status=pending')
 * - If API is unreachable or returns error, falls back to local mock data so UI remains functional.
 * - Approve/Reject try API patch; on failure they fall back to updating local state (optimistic).
 */

const MOCK_ITEMS = [
  {
    id: 101,
    title: "Beachside Villa",
    agent: "Jane Doe",
    status: "pending",
  },
  {
    id: 102,
    title: "Downtown Flat",
    agent: "John Smith",
    status: "pending",
  },
];

const ManageProperties = () => {
  const api = useAxiosSecure();
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of item being acted on

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        // Try real API
        const res = await api.get("/admin/properties?status=pending");
        const data = res?.data?.data;

        if (!mounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          // No data returned — use mock for now
          setItems(MOCK_ITEMS);
        }
      } catch (err) {
        // Network / URL missing / server down — fall back to mock data
        console.warn("ManageProperties: fetch failed, using mock data.", err);
        if (!mounted) return;
        setItems(MOCK_ITEMS);
        setFetchError("Unable to fetch from API. Using mock data.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
    // We intentionally include api in deps so if hook instance changes, it will re-run.
  }, [api]);

  const removeFromList = (id) => {
    setItems((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
  };

  const approve = async (id) => {
    setActionLoading(id);
    try {
      // Try real API call first
      await api.patch(`/admin/properties/${id}`, { status: "approved" });
      removeFromList(id);
      toast.success("Property approved");
    } catch (err) {
      // Fallback: update UI optimistically and notify user that we used mock fallback
      console.warn(
        "Approve failed — falling back to optimistic UI update",
        err
      );
      removeFromList(id);
      toast.info("Property approved locally (API unreachable).");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/properties/${id}`, { status: "rejected" });
      removeFromList(id);
      toast.success("Property rejected");
    } catch (err) {
      console.warn("Reject failed — falling back to optimistic UI update", err);
      removeFromList(id);
      toast.info("Property rejected locally (API unreachable).");
    } finally {
      setActionLoading(null);
    }
  };

  // Retry fetch handler for developer convenience when API becomes available
  const handleRetryFetch = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get("/admin/properties?status=pending");
      const data = res?.data?.data;
      setItems(Array.isArray(data) && data.length ? data : MOCK_ITEMS);
      toast.success("Fetched properties from API");
    } catch (err) {
      setItems(MOCK_ITEMS);
      setFetchError("Retry failed — still using mock data.");
      toast.error("Retry failed. Still using mock data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !items) {
    return (
      <div className="space-y-6">
        {/* Adjusted w-1/3 to w-full sm:w-1/3 for responsive skeleton */}
        <div className="w-full h-8 mb-6 rounded bg-secondary-100 animate-pulse sm:w-1/3" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded bg-secondary-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: Title and Controls */}
      {/* Change flex-items-start/justify-between to flex-col on mobile, using sm: to maintain row layout on desktop */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">
          Manage Properties
        </h1>

        {/* Controls: Fetch Status and Retry Button */}
        {/* Change to flex-col on mobile, aligning to the left, using sm: to maintain row layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {fetchError && (
            <div className="px-3 py-1 text-sm text-orange-700 rounded bg-orange-50">
              {fetchError}
            </div>
          )}
          <button
            onClick={handleRetryFetch}
            // Ensure button doesn't stretch full width unnecessarily, keeping it w-auto by default
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            aria-label="Retry fetch properties"
          >
            Retry
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            No pending properties.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              // Item container: Change from flex-row to flex-col on mobile, using sm: to revert
              className="flex flex-col gap-3 p-4 bg-white shadow rounded-2xl sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Property Details: Always stacked */}
              <div>
                <div className="font-medium text-text-primary">{it.title}</div>
                <div className="text-xs text-text-secondary">
                  By {it.agent} · {it.status}
                </div>
              </div>

              {/* Action Buttons: Stacks on mobile, uses full width */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  onClick={() => approve(it.id)}
                  // Make buttons full width on mobile, auto width on sm:
                  className="w-full px-3 py-1 text-white rounded sm:w-auto bg-success disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={actionLoading === it.id}
                  aria-disabled={actionLoading === it.id}
                >
                  {actionLoading === it.id ? "Working..." : "Approve"}
                </button>

                <button
                  onClick={() => setSelected(it)}
                  // Make buttons full width on mobile, auto width on sm:
                  className="w-full px-3 py-1 border rounded sm:w-auto"
                >
                  Preview
                </button>

                <button
                  onClick={() => reject(it.id)}
                  // Make buttons full width on mobile, auto width on sm:
                  className="w-full px-3 py-1 text-white rounded sm:w-auto bg-error disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={actionLoading === it.id}
                  aria-disabled={actionLoading === it.id}
                >
                  {actionLoading === it.id ? "Working..." : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={!!selected}
        title={`Reject ${selected?.title}?`}
        description="Are you sure you want to reject this listing? You can provide a reason in the backend."
        onCancel={() => setSelected(null)}
        onConfirm={() => {
          // capture id first to avoid closure issues
          const id = selected?.id;
          setSelected(null);
          if (id != null) reject(id);
        }}
      />
    </div>
  );
};

export default ManageProperties;
