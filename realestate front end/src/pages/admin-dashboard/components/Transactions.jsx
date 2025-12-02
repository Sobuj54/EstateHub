import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "components/ui/ConfirmModal";
import useAxiosSecure from "hooks/useAxiosSecure";

const MOCK_TX = [
  {
    id: 9001,
    user: "Alice",
    amount: 1200,
    currency: "USD",
    status: "completed",
  },
  { id: 9002, user: "Bob", amount: 500, currency: "USD", status: "pending" },
  {
    id: 9003,
    user: "Carol",
    amount: 250,
    currency: "USD",
    status: "completed",
  },
];

const Transactions = () => {
  const api = useAxiosSecure();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [processingRefundId, setProcessingRefundId] = useState(null);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (mockMode) {
        if (!mounted) return;
        setItems(MOCK_TX);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/admin/transactions");
        const data = res?.data?.data ?? res?.data ?? null;
        if (!mounted) return;
        setItems(Array.isArray(data) && data.length ? data : MOCK_TX);
      } catch {
        if (!mounted) return;
        setItems(MOCK_TX);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [api, mockMode]);

  const refund = async (id) => {
    if (!id) return;
    setProcessingRefundId(id);
    const prev = items;
    setItems((prevList) =>
      prevList.map((it) => (it.id === id ? { ...it, status: "refunding" } : it))
    );
    try {
      if (mockMode) await new Promise((r) => setTimeout(r, 700));
      else await api.post(`/admin/transactions/${id}/refund`);
      setItems((prevList) =>
        prevList.map((it) =>
          it.id === id ? { ...it, status: "refunded" } : it
        )
      );
      toast.success("Refund issued");
    } catch {
      setItems(prev);
      toast.error("Refund failed — please try again");
    } finally {
      setProcessingRefundId(null);
      setSelectedRefund(null);
    }
  };

  if (loading || !items) {
    return (
      <div className="space-y-4">
        <div className="w-1/3 h-8 rounded bg-secondary-100 animate-pulse" />
        <div className="overflow-x-auto bg-white shadow rounded-2xl">
          <table className="min-w-full">
            <thead className="sr-only">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="w-20 h-4 rounded bg-secondary-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-4 rounded bg-secondary-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-4 rounded bg-secondary-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-4 rounded bg-secondary-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-8 rounded bg-secondary-100 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Transactions</h1>
        <div className="flex flex-col items-start w-full gap-2 sm:flex-row sm:items-center sm:gap-3 sm:w-auto">
          <label className="inline-flex items-center space-x-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>Developer mock</span>
          </label>
          <button
            onClick={() => {
              const csv = [
                ["id", "user", "amount", "currency", "status"],
                ...items.map((r) => [
                  r.id,
                  r.user,
                  r.amount,
                  r.currency,
                  r.status,
                ]),
              ]
                .map((row) =>
                  row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `transactions-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="w-full px-3 py-2 text-sm font-medium text-white rounded-md bg-primary sm:w-auto"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto bg-white shadow rounded-2xl sm:block">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                ID
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                User
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Amount
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-text-secondary">
                Status
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 font-medium text-text-primary">
                  {tx.id}
                </td>
                <td className="px-6 py-4 text-text-secondary">{tx.user}</td>
                <td className="px-6 py-4">
                  {tx.currency} {tx.amount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                      tx.status === "completed"
                        ? "bg-green-50 text-success"
                        : tx.status === "pending"
                        ? "bg-yellow-50 text-yellow-700"
                        : tx.status === "refunded"
                        ? "bg-gray-100 text-text-secondary"
                        : tx.status === "refunding"
                        ? "bg-blue-50 text-primary"
                        : "bg-secondary-100 text-text-secondary"
                    }`}
                    aria-live="polite"
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {tx.status === "completed" ? (
                    <button
                      onClick={() => setSelectedRefund(tx)}
                      disabled={processingRefundId !== null}
                      className={`px-3 py-1 text-sm rounded ${
                        processingRefundId === tx.id
                          ? "bg-gray-300 text-text-secondary cursor-not-allowed"
                          : "bg-error text-white hover:opacity-90"
                      }`}
                      aria-disabled={processingRefundId !== null}
                    >
                      {processingRefundId === tx.id
                        ? "Processing..."
                        : "Refund"}
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 text-sm border rounded text-text-secondary"
                      disabled
                    >
                      N/A
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 sm:hidden">
        {items.map((tx) => (
          <div
            key={tx.id}
            className="flex flex-col gap-2 p-4 bg-white shadow rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium truncate text-text-primary">
                {tx.user}
              </div>
              <span className="text-xs text-text-secondary">{tx.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {tx.currency} {tx.amount}
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                  tx.status === "completed"
                    ? "bg-green-50 text-success"
                    : tx.status === "pending"
                    ? "bg-yellow-50 text-yellow-700"
                    : tx.status === "refunded"
                    ? "bg-gray-100 text-text-secondary"
                    : tx.status === "refunding"
                    ? "bg-blue-50 text-primary"
                    : "bg-secondary-100 text-text-secondary"
                }`}
                aria-live="polite"
              >
                {tx.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedRefund(tx)}
              disabled={
                processingRefundId !== null || tx.status !== "completed"
              }
              className={`w-full px-3 py-2 rounded text-white ${
                processingRefundId === tx.id
                  ? "bg-gray-300 text-text-secondary cursor-not-allowed"
                  : tx.status === "completed"
                  ? "bg-error hover:opacity-90"
                  : "bg-gray-200 text-text-secondary cursor-not-allowed"
              }`}
            >
              {processingRefundId === tx.id
                ? "Processing..."
                : tx.status === "completed"
                ? "Refund"
                : "N/A"}
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!selectedRefund}
        title="Issue refund"
        description={
          selectedRefund
            ? `Refund ${selectedRefund.currency} ${selectedRefund.amount} for transaction ${selectedRefund.id}?`
            : ""
        }
        onCancel={() => setSelectedRefund(null)}
        onConfirm={() => selectedRefund?.id && refund(selectedRefund.id)}
        confirmLabel="Confirm refund"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default Transactions;
