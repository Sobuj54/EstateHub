// src/pages/admin/Moderation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "components/ui/ConfirmModal";
import useAxiosSecure from "hooks/useAxiosSecure";

/**
 * Moderation
 *
 * Improvements:
 * - Search & client-side pagination (keeps UI usable without backend)
 * - Confirm modal for destructive actions
 * - Optimistic UI updates with rollback on failure
 * - Action-level loading states and accessible buttons
 * - Clear skeletons while loading
 * - Small UI/UX polish (badges, timestamps room, responsive)
 */

const MOCK_FLAGS = [
  {
    id: 1,
    type: "listing",
    reason: "Spam images",
    refTitle: "Scam Listing",
    reportedBy: "user1",
    createdAt: "2025-11-28T08:12:00Z",
  },
  {
    id: 2,
    type: "message",
    reason: "Abusive language",
    refTitle: "Conversation #233",
    reportedBy: "user2",
    createdAt: "2025-11-27T18:05:00Z",
  },
  {
    id: 3,
    type: "listing",
    reason: "Inaccurate pricing",
    refTitle: "Old Farmhouse",
    reportedBy: "user3",
    createdAt: "2025-11-25T10:00:00Z",
  },
];

const TYPE_LABELS = {
  listing: "Listing",
  message: "Message",
  review: "Review",
};

const Moderation = () => {
  const api = useAxiosSecure();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  // ui states
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [selectedResolve, setSelectedResolve] = useState(null); // { id, action }
  const [processingId, setProcessingId] = useState(null); // single action at a time
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (mockMode) {
          // dev fallback
          if (!mounted) return;
          setQueue(MOCK_FLAGS);
          setLoading(false);
          return;
        }

        const res = await api.get("/admin/flags");
        const data = res?.data?.data ?? res?.data ?? [];
        if (!mounted) return;
        setQueue(Array.isArray(data) && data.length ? data : MOCK_FLAGS);
      } catch (err) {
        console.warn("Failed to load flags, using mock", err);
        if (!mounted) return;
        setQueue(MOCK_FLAGS);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, mockMode]);

  // derived filtered + paginated list
  const filtered = useMemo(() => {
    if (!queue) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [...queue];
    return queue.filter(
      (f) =>
        (f.refTitle || "").toLowerCase().includes(q) ||
        (f.reason || "").toLowerCase().includes(q) ||
        (f.reportedBy || "").toLowerCase().includes(q) ||
        (TYPE_LABELS[f.type] || f.type).toLowerCase().includes(q)
    );
  }, [queue, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  // confirm + perform action (dismiss / remove)
  const confirmResolve = (flag, action) => {
    setSelectedResolve({ ...flag, action });
  };

  const performResolve = async (id, action) => {
    setProcessingId(id);
    const original = queue;
    // optimistic remove from queue
    setQueue((prev) => prev.filter((f) => f.id !== id));
    setSelectedResolve(null);

    try {
      if (!mockMode) {
        await api.post(`/admin/flags/${id}/resolve`, { action });
      } else {
        // simulate server delay
        await new Promise((r) => setTimeout(r, 600));
      }
      toast.success(
        action === "remove"
          ? "Removed content & resolved flag"
          : "Flag dismissed"
      );
      // no further action; optimistic already removed
    } catch (err) {
      // rollback on failure
      console.error("Resolve failed", err);
      setQueue(original);
      toast.error("Could not perform action, please try again");
    } finally {
      setProcessingId(null);
    }
  };

  // helper formatting date (room for i18n)
  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // UI skeleton
  if (loading || !queue) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">
            Moderation Queue
          </h1>
          <div>
            <label className="inline-flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={mockMode}
                onChange={(e) => setMockMode(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-text-secondary">Developer mock</span>
            </label>
          </div>
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white shadow rounded-2xl">
            <div className="w-1/3 h-5 mb-2 rounded bg-secondary-100 animate-pulse" />
            <div className="w-1/2 h-4 rounded bg-secondary-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Moderation Queue
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Review reported items, dismiss false reports, or remove offending
            content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center space-x-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>Developer mock</span>
          </label>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, reason, user or type..."
              className="block w-full max-w-xs px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search moderation queue"
            />
          </div>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="text-text-secondary">No flags match your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 p-4 bg-white shadow rounded-2xl sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-text-primary">
                    {item.refTitle}
                  </div>
                  <div className="px-2 py-0.5 text-xs rounded bg-secondary-100 text-text-secondary">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </div>
                </div>

                <div className="mt-1 text-sm text-text-secondary">
                  <span className="mr-2">Reason:</span>
                  <span className="font-medium text-text-primary">
                    {item.reason}
                  </span>
                </div>

                <div className="mt-2 text-xs text-text-secondary">
                  Reported by{" "}
                  <span className="font-medium">{item.reportedBy}</span> ·{" "}
                  <span>{fmt(item.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={processingId === item.id}
                  onClick={() => confirmResolve(item, "dismiss")}
                  className="px-3 py-1 text-sm border rounded hover:bg-secondary-100"
                  aria-disabled={processingId === item.id}
                >
                  {processingId === item.id &&
                  selectedResolve?.action === "dismiss"
                    ? "Processing..."
                    : "Dismiss"}
                </button>

                <button
                  disabled={processingId === item.id}
                  onClick={() => confirmResolve(item, "remove")}
                  className="px-3 py-1 text-sm text-white rounded bg-error hover:opacity-90"
                  aria-disabled={processingId === item.id}
                >
                  {processingId === item.id &&
                  selectedResolve?.action === "remove"
                    ? "Processing..."
                    : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-secondary">
          Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} -
          {Math.min(page * perPage, filtered.length)} of {filtered.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            aria-label="Previous page"
          >
            Prev
          </button>
          <div className="px-3 py-1 text-sm border rounded bg-background">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!selectedResolve}
        title={
          selectedResolve?.action === "remove"
            ? "Remove Content & Resolve"
            : "Dismiss Flag"
        }
        description={
          selectedResolve
            ? selectedResolve.action === "remove"
              ? `Remove "${selectedResolve.refTitle}" and resolve this flag? This will delete or hide the referenced content.`
              : `Dismiss the flag on "${selectedResolve.refTitle}"? This will keep the content and mark the flag as resolved.`
            : ""
        }
        onCancel={() => setSelectedResolve(null)}
        onConfirm={() => {
          if (selectedResolve?.id && selectedResolve?.action) {
            performResolve(selectedResolve.id, selectedResolve.action);
          }
        }}
        confirmLabel={
          selectedResolve?.action === "remove"
            ? "Confirm remove"
            : "Confirm dismiss"
        }
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default Moderation;
