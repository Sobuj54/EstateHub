// src/Routes.jsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import Homepage from "pages/homepage";
import PropertyListings from "pages/property-listings";
import PropertyDetails from "pages/property-details";
import NotFound from "pages/NotFound";
import Login from "pages/auth/login";
import Signup from "pages/auth/Register";
import ForgotPassword from "pages/auth/FogotPassword";
import ResetPassword from "pages/auth/ResetPassword";
import Unauthorized from "pages/unauthorized/Unauthorized";
import ProtectedRoute from "components/ProtectedRoute";
import MemberRoutes from "MemberRoutes";

const AdminRoutes = lazy(() => import("AdminRoutes"));
const UserProfileSettings = lazy(() => import("pages/user-profile-settings"));
const AgentDashboard = lazy(() => import("pages/agent-dashboard"));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <RouterRoutes>
            <Route path="/" element={<Homepage />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/property-listings" element={<PropertyListings />} />
            <Route path="/property-details/:id" element={<PropertyDetails />} />
            <Route
              path="/agent-dashboard/*"
              element={
                <ProtectedRoute allow={["agent"]}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/member/*" element={<MemberRoutes />} />
            <Route
              path="/user-profile-settings"
              element={
                <ProtectedRoute>
                  <UserProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
