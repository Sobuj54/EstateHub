// src/pages/user-profile-settings/index.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import ProfileInformation from "./components/ProfileInformation";
import AccountSettings from "./components/AccountSettings";
import SavedSearches from "./components/SavedSearches";
import FavoriteProperties from "./components/FavoriteProperties";
import BusinessProfile from "./components/BusinessProfile";
import PrivacyControls from "./components/PrivacyControls";
import PaymentMethods from "./components/PaymentMethods";
import ActivityHistory from "./components/ActivityHistory";
import MobileTabNavigation from "./components/MobileTabNavigation";
import DesktopTabNavigation from "./components/DesktopTabNavigation";
import { Helmet } from "react-helmet";
import useAuthContext from "hooks/useAuthContext";

/**
 * UserProfileSettings
 * - Uses real auth context instead of dummy data
 * - Keeps your existing tab / save UX (auto-save simulation)
 * - Exports real user data from auth context
 */

const UserProfileSettings = () => {
  const { user, loading: authLoading, userStatus } = useAuthContext();

  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  // Tabs: roles use your actual roles: 'member', 'agent', 'admin', 'super_admin'
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: "User",
      component: ProfileInformation,
      roles: ["all"],
    },
    {
      id: "account",
      label: "Account Settings",
      icon: "Settings",
      component: AccountSettings,
      roles: ["all"],
    },
    {
      id: "searches",
      label: "Saved Searches",
      icon: "Search",
      component: SavedSearches,
      roles: ["member"], // previously 'buyer' -> mapped to 'member'
    },
    {
      id: "favorites",
      label: "Favorite Properties",
      icon: "Heart",
      component: FavoriteProperties,
      roles: ["member", "agent", "seller"],
    },
    {
      id: "business",
      label: "Business Profile",
      icon: "Building2",
      component: BusinessProfile,
      roles: ["agent"],
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: "Shield",
      component: PrivacyControls,
      roles: ["all"],
    },
    {
      id: "payments",
      label: "Payment Methods",
      icon: "CreditCard",
      component: PaymentMethods,
      roles: ["agent"],
    },
    {
      id: "activity",
      label: "Activity History",
      icon: "Clock",
      component: ActivityHistory,
      roles: ["all"],
    },
  ];

  // Helper: determine if a tab is visible for current user role
  const tabVisibleForUser = (tab, userRole) => {
    if (!tab.roles || tab.roles.includes("all")) return true;
    if (!userRole) return false;
    return tab.roles.includes(userRole);
  };

  // compute filteredTabs from real auth user
  const filteredTabs = tabs.filter((tab) => {
    if (!user) {
      // when user is not loaded yet, keep universal tabs only
      return tab.roles.includes("all");
    }
    return tabVisibleForUser(tab, user.role);
  });

  useEffect(() => {
    // Page skeleton while component mounts and auth resolves.
    // Wait for auth to resolve (or at most 1s) so UI doesn't flash.
    let timer = null;

    if (authLoading) {
      setIsLoading(true);
      // Will be cleared when authLoading becomes false via next effect
    } else {
      // Give a tiny fade-in feel
      timer = setTimeout(() => setIsLoading(false), 300);
    }

    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    // Auto-save functionality — we keep your existing simulated save behavior,
    // but you can change this to call real API to persist changes.
    if (hasUnsavedChanges) {
      setAutoSaveStatus("saving");

      // Simulated API save: you can replace this with an actual save call.
      const saveTimer = setTimeout(async () => {
        try {
          // Optionally: if you have an endpoint to refresh user status after internal saves:
          if (typeof userStatus === "function") {
            // refresh auth user info from backend
            await userStatus();
          }
          setAutoSaveStatus("saved");
          setHasUnsavedChanges(false);
        } catch (err) {
          console.error("Auto-save failed", err);
          setAutoSaveStatus("error");
        }
      }, 1200);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, userStatus]);

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave this section?"
        )
      ) {
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
        setIsMobileMenuOpen(false);
      }
    } else {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
    }
  };

  const handleDataChange = () => {
    // Called by child components to mark something dirty
    setHasUnsavedChanges(true);
  };

  const handleExportData = () => {
    // Export user data from real auth context (if available)
    const exportUser = user || {
      id: "unknown",
      name: "guest",
      email: "",
    };

    const exportData = {
      profile: exportUser,
      exportDate: new Date().toISOString(),
      dataType: "personal_data",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profile-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Active component to render for the tab
  const ActiveTabComponent =
    filteredTabs.find((tab) => tab.id === activeTab)?.component ||
    ProfileInformation;

  // If auth loading show skeleton (we already have isLoading skeleton)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="w-1/3 h-8 mb-4 rounded bg-secondary-100 skeleton"></div>
              <div className="w-1/2 h-4 rounded bg-secondary-100 skeleton"></div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1">
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded bg-secondary-100 skeleton"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="h-64 rounded-lg bg-secondary-100 skeleton"></div>
                  <div className="h-48 rounded-lg bg-secondary-100 skeleton"></div>
                  <div className="h-32 rounded-lg bg-secondary-100 skeleton"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main UI (user present)
  return (
    <>
      <Helmet>
        <title>EstateHub | Profile</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-16 lg:pt-18">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-text-primary font-heading">
                    Profile & Settings
                  </h1>
                  <p className="text-text-secondary">
                    Manage your account information and preferences
                  </p>
                </div>

                {/* Auto-save Status & Export */}
                <div className="flex items-center mt-4 space-x-4 md:mt-0">
                  {/* Auto-save Status */}
                  <div className="flex items-center space-x-2 text-sm">
                    {autoSaveStatus === "saving" && (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
                        <span className="text-text-secondary">Saving...</span>
                      </>
                    )}
                    {autoSaveStatus === "saved" && (
                      <>
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-success">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-success">Saved</span>
                      </>
                    )}
                    {autoSaveStatus === "error" && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-error"></div>
                        <span className="text-error">Save failed</span>
                      </>
                    )}
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={handleExportData}
                    className="text-sm font-medium transition-colors duration-200 text-primary hover:text-primary-700"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="mb-6 lg:hidden">
              <MobileTabNavigation
                tabs={filteredTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isMenuOpen={isMobileMenuOpen}
                onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>

            {/* Desktop Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Desktop Sidebar Navigation */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="lg:sticky lg:top-20 lg:max-h-screen lg:overflow-y-auto lg:pb-20">
                  <DesktopTabNavigation
                    tabs={filteredTabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                <div className="min-h-screen lg:min-h-0">
                  {ActiveTabComponent && (
                    <ActiveTabComponent
                      user={user}
                      onDataChange={handleDataChange}
                      hasUnsavedChanges={hasUnsavedChanges}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserProfileSettings;
