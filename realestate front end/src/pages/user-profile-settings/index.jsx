// src/pages/user-profile-settings/index.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
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
import useAuthContext from "hooks/useAuthContext";

const UserProfileSettings = () => {
  const { user, loading: authLoading, userStatus } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [isLoading, setIsLoading] = useState(true);

  // Tabs configuration
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
      roles: ["member"],
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

  const tabVisibleForUser = (tab, userRole) => {
    if (!tab.roles || tab.roles.includes("all")) return true;
    if (!userRole) return false;
    return tab.roles.includes(userRole);
  };

  const filteredTabs = tabs.filter((tab) => {
    if (!user) return tab.roles.includes("all");
    return tabVisibleForUser(tab, user.role);
  });

  // Skeleton loader effect
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      setAutoSaveStatus("saving");
      const saveTimer = setTimeout(async () => {
        try {
          if (typeof userStatus === "function") await userStatus();
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

  // Tab change handler
  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave this section?"
        )
      ) {
        setSearchParams({ tab: tabId });
        setHasUnsavedChanges(false);
        setIsMobileMenuOpen(false);
      }
    } else {
      setSearchParams({ tab: tabId });
      setIsMobileMenuOpen(false);
    }
  };

  const handleDataChange = () => setHasUnsavedChanges(true);

  const handleExportData = () => {
    const exportUser = user || { id: "unknown", name: "guest", email: "" };
    const exportData = {
      profile: exportUser,
      exportDate: new Date().toISOString(),
      dataType: "personal_data",
    };
    const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
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

  const ActiveTabComponent =
    filteredTabs.find((tab) => tab.id === currentTab)?.component ||
    ProfileInformation;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 py-8 pt-16 mx-auto lg:pt-18 max-w-7xl">
          {/* Skeleton UI */}
          <div className="w-1/3 h-8 mb-4 rounded bg-secondary-100 skeleton"></div>
          <div className="w-1/2 h-4 rounded bg-secondary-100 skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EstateHub | Profile</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-8 pt-16 mx-auto lg:pt-18 max-w-7xl">
          <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-text-primary font-heading">
                Profile & Settings
              </h1>
              <p className="text-text-secondary">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center mt-4 space-x-4 md:mt-0">
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
              <button
                onClick={handleExportData}
                className="text-sm font-medium transition-colors duration-200 text-primary hover:text-primary-700"
              >
                Export Data
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="mb-6 lg:hidden">
            <MobileTabNavigation
              tabs={filteredTabs}
              activeTab={currentTab}
              onTabChange={handleTabChange}
              isMenuOpen={isMobileMenuOpen}
              onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>

          {/* Desktop Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="hidden lg:block lg:col-span-1">
              <div className="lg:sticky lg:top-20 lg:max-h-screen lg:overflow-y-auto lg:pb-20">
                <DesktopTabNavigation
                  tabs={filteredTabs}
                  activeTab={currentTab}
                  onTabChange={handleTabChange}
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              {ActiveTabComponent && (
                <ActiveTabComponent
                  user={user}
                  onDataChange={handleDataChange}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserProfileSettings;
