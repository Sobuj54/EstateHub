// src/pages/admin/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "pages/admin-dashboard/components/AdminSidebar";
import Header from "components/ui/Header";
import AdminDashboard from "pages/admin-dashboard/AdminDashboard";
import ManageAgents from "pages/admin-dashboard/components/ManageAgents";
import ManageMembers from "pages/admin-dashboard/components/ManageMembers";
import ManageProperties from "pages/admin-dashboard/components/ManageProperties";
import NotFound from "pages/NotFound";
import AdminSettings from "pages/admin-dashboard/components/AdminSettings";

const AdminRoutes = () => {
  return (
    <main>
      <Header />
      <div className="flex min-h-screen mx-auto bg-background max-w-7xl ">
        <AdminSidebar />
        <div className="flex-1">
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="agents" element={<ManageAgents />} />
              <Route path="members" element={<ManageMembers />} />
              <Route path="properties" element={<ManageProperties />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </main>
  );
};

export default AdminRoutes;
