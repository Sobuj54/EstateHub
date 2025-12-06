import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Icon from "components/AppIcon";
import useAuthContext from "hooks/useAuthContext";
import { ToastContainer } from "react-toastify";

const AdminLayout = () => {
  // Collapsed state for large screens sidebar (w-24/w-64)
  const [collapsed, setCollapsed] = useState(false);
  // New state for mobile sidebar open/close
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const sidebarItems = [
    { label: "Overview", to: "/admin/dashboard", icon: "Home" },
    { label: "Members", to: "/admin/members", icon: "Users" },
    { label: "Agents", to: "/admin/agents", icon: "UserCheck" },
    { label: "Properties", to: "/admin/properties", icon: "Building" },
    { label: "Moderation", to: "/admin/moderation", icon: "Flag" },
    { label: "Transactions", to: "/admin/transactions", icon: "CreditCard" },
    { label: "Reports", to: "/admin/reports", icon: "BarChart" },
    { label: "Settings", to: "/admin/settings", icon: "Settings" },
  ];

  if (!user) {
    return null;
  }

  // Function to close the mobile menu after navigation
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Mobile Header (visible only on small screens) */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 border-b md:hidden border-border bg-surface">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/homepage")}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Icon name="Home" size={16} color="white" />
          </div>
          <span className="ml-2 text-base font-semibold text-text-primary">
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen((s) => !s)}
          className="p-2 rounded hover:bg-secondary-100"
          aria-label="Toggle mobile sidebar"
        >
          <Icon name={isMobileOpen ? "X" : "Menu"} size={24} />
        </button>
      </header>

      <div className="flex">
        {/* Mobile Backdrop (visible when mobile menu is open) */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar Component */}
        <aside
          className={`
            transition-all duration-200 p-4 border-r border-border bg-surface z-20
            md:block 
            ${
              // Desktop Sidebar styles
              collapsed ? "md:w-24" : "md:w-64"
            }
            ${
              // Mobile Sidebar styles
              isMobileOpen
                ? "fixed inset-y-0 left-0 w-64 shadow-2xl" // Full height, from left
                : "hidden"
            }
          `}
        >
          {/* Logo and Collapse Toggle */}
          <div className="flex items-center justify-between mb-8">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                navigate("/homepage");
                closeMobileMenu(); // Close on click for mobile
              }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                <Icon name="Home" size={18} color="white" />
              </div>
              {/* Hide text when collapsed on desktop, or always on mobile */}
              {!collapsed && !isMobileOpen && (
                <span className="ml-3 text-lg font-semibold text-text-primary">
                  EstateHub Admin
                </span>
              )}
              {/* Always show text on mobile open */}
              {isMobileOpen && (
                <span className="ml-3 text-lg font-semibold text-text-primary">
                  EstateHub Admin
                </span>
              )}
            </div>

            {/* Collapse button - only visible on desktop, X button on mobile is in the header */}
            <button
              onClick={() => setCollapsed((s) => !s)}
              className="hidden p-2 rounded hover:bg-secondary-100 md:block" // Desktop only
              aria-label="Toggle sidebar"
            >
              <Icon
                name={collapsed ? "ChevronRight" : "ChevronLeft"}
                size={18}
              />
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                onClick={closeMobileMenu} // Close on click for mobile
                className={({ isActive }) =>
                  `flex items-center ${
                    // Adjust justify-center for collapsed desktop, but not for mobile
                    collapsed ? "md:justify-center" : ""
                  } p-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary-100 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                  }`
                }
              >
                <Icon name={it.icon} size={20} />
                {/* Always show label on mobile open, or show only when not collapsed on desktop */}
                {(!collapsed || isMobileOpen) && (
                  <span className="ml-3">{it.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8">
            {/* Show user info only when not collapsed on desktop OR when mobile sidebar is open */}
            {(!collapsed || isMobileOpen) && (
              <div className="text-xs text-text-secondary">
                Signed in as <br />
                <strong className="text-text-primary">{user.name}</strong>
                <div className="mt-2 text-xxs text-text-secondary">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen p-4 md:p-6">
          {" "}
          {/* Reduce padding on small screens */}
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
