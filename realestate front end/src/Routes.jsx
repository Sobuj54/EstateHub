// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import Homepage from "pages/homepage";
import PropertyListings from "pages/property-listings";
import PropertyDetails from "pages/property-details";
import AgentDashboard from "pages/agent-dashboard";
import UserProfileSettings from "pages/user-profile-settings";
import NotFound from "pages/NotFound";
import Login from "pages/auth/login";
import Signup from "pages/auth/Register";
import ForgotPassword from "pages/auth/FogotPassword";
import ResetPassword from "pages/auth/ResetPassword";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/property-listings" element={<PropertyListings />} />
          <Route path="/property-details" element={<PropertyDetails />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route
            path="/user-profile-settings"
            element={<UserProfileSettings />}
          />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
