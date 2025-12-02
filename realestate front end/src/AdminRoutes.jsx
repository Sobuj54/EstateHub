import ProtectedRoute from "components/ProtectedRoute";
import AdminDashboard from "pages/admin-dashboard/AdminDashboard";
import AdminLayout from "pages/admin-dashboard/AdminLayout";
import Settings from "pages/admin-dashboard/components/AdminSettings";
import ManageAgents from "pages/admin-dashboard/components/ManageAgents";
import ManageMembers from "pages/admin-dashboard/components/ManageMembers";
import ManageProperties from "pages/admin-dashboard/components/ManageProperties";
import Moderation from "pages/admin-dashboard/components/Modaration";
import Reports from "pages/admin-dashboard/components/Reports";
import Transactions from "pages/admin-dashboard/components/Transactions";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allow={["admin", "super_admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<ManageMembers />} />
        <Route path="agents" element={<ManageAgents />} />
        <Route path="properties" element={<ManageProperties />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
