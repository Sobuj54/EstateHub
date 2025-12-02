// src/routes/MemberRoutes.jsx
import ProtectedRoute from "components/ProtectedRoute";
import Appointments from "pages/member-dashboard/components/Appointments";
import Messages from "pages/member-dashboard/components/Messages";
import Notifications from "pages/member-dashboard/components/Notifications";
import ProfileSettings from "pages/member-dashboard/components/ProfileSettings";
import SavedProperties from "pages/member-dashboard/components/SavedProperties";
import SearchProperties from "pages/member-dashboard/components/SearchProperties";
import MemberDashboard from "pages/member-dashboard/MemberDashboard";
import MemberLayout from "pages/member-dashboard/MemberLayout";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const MemberRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allow={["member"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="search" element={<SearchProperties />} />
        <Route path="saved" element={<SavedProperties />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default MemberRoutes;
