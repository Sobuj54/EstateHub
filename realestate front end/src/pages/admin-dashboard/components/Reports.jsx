import React from "react";

const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">
        Reports & Exports
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="font-semibold text-text-primary">
            User Activity Report
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Generate CSV or schedule recurring reports for user activity,
            signups, and retention.
          </p>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 text-white rounded bg-primary">
              Run report
            </button>
            <button className="px-4 py-2 border rounded">Schedule</button>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="font-semibold text-text-primary">Finance / Payouts</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Export payments, reconciliation, and payout statements.
          </p>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 text-white rounded bg-primary">
              Export CSV
            </button>
            <button className="px-4 py-2 border rounded">Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
