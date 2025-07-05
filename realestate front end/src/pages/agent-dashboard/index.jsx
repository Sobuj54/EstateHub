// src/pages/agent-dashboard/index.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import PerformanceMetrics from "./components/PerformanceMetrics";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import ActiveListings from "./components/ActiveListings";
import LeadManagement from "./components/LeadManagement";
import UpcomingShowings from "./components/UpcomingShowings";
import AnalyticsSection from "./components/AnalyticsSection";
import QuickListingForm from "./components/QuickListingForm";
import { Helmet } from "react-helmet";

const AgentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickListingForm, setShowQuickListingForm] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Simulate real-time notifications
    const notificationTimer = setInterval(() => {
      const mockNotifications = [
        "New lead inquiry for 123 Oak Street",
        "Price reduction approved for 456 Pine Ave",
        "Showing scheduled for tomorrow at 2 PM",
      ];
      const randomNotification =
        mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: randomNotification,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4),
      ]);
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(notificationTimer);
    };
  }, []);

  const handleBulkAction = (action, listingIds) => {
    console.log(`Bulk action ${action} for listings:`, listingIds);
    // Implement bulk action logic
  };

  const handleQuickListing = () => {
    setShowQuickListingForm(true);
  };

  const handleListingSubmit = (listingData) => {
    console.log("New listing data:", listingData);
    setShowQuickListingForm(false);
    // Implement listing creation logic
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Dashboard Skeleton */}
            <div className="mb-8">
              <div className="w-1/3 h-8 mb-4 rounded bg-secondary-100 skeleton"></div>
              <div className="w-1/2 h-4 rounded bg-secondary-100 skeleton"></div>
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg bg-surface shadow-elevation-1"
                >
                  <div className="w-1/2 h-4 mb-2 rounded bg-secondary-100 skeleton"></div>
                  <div className="w-3/4 h-8 rounded bg-secondary-100 skeleton"></div>
                </div>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="h-64 mb-8 rounded-lg bg-secondary-100 skeleton"></div>
                <div className="rounded-lg h-96 bg-secondary-100 skeleton"></div>
              </div>
              <div className="space-y-8">
                <div className="h-64 rounded-lg bg-secondary-100 skeleton"></div>
                <div className="h-64 rounded-lg bg-secondary-100 skeleton"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EstateHub | Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-16 lg:pt-18">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-text-primary font-heading">
                    Agent Dashboard
                  </h1>
                  <p className="text-text-secondary">
                    Manage your listings, track leads, and monitor performance
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={handleQuickListing}
                    className="px-6 py-3 font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 micro-interaction shadow-elevation-1"
                  >
                    Create New Listing
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <PerformanceMetrics />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-3">
              {/* Main Content Area */}
              <div className="space-y-8 lg:col-span-2">
                {/* Quick Actions */}
                <QuickActions onQuickListing={handleQuickListing} />

                {/* Active Listings Table */}
                <ActiveListings
                  selectedListings={selectedListings}
                  onSelectionChange={setSelectedListings}
                  onBulkAction={handleBulkAction}
                />

                {/* Analytics Section */}
                <AnalyticsSection />
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Recent Activity */}
                <RecentActivity notifications={notifications} />

                {/* Lead Management */}
                <LeadManagement />

                {/* Upcoming Showings */}
                <UpcomingShowings />
              </div>
            </div>
          </div>
        </main>

        {/* Quick Listing Form Modal */}
        {showQuickListingForm && (
          <QuickListingForm
            onClose={() => setShowQuickListingForm(false)}
            onSubmit={handleListingSubmit}
          />
        )}
      </div>
    </>
  );
};

export default AgentDashboard;
