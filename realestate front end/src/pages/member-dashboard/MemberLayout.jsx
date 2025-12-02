// src/pages/member-dashboard/MemberLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Icon from "components/AppIcon";
import useAuthContext from "hooks/useAuthContext";

const MemberLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const sidebarItems = [
    { label: "Dashboard", to: "/member/dashboard", icon: "Home" },
    { label: "Search Properties", to: "/member/search", icon: "Search" },
    { label: "Saved Properties", to: "/member/saved", icon: "Heart" },
    { label: "Appointments", to: "/member/appointments", icon: "Calendar" },
    { label: "Messages", to: "/member/messages", icon: "MessageCircle" },
    { label: "Notifications", to: "/member/notifications", icon: "Bell" },
    { label: "Profile", to: "/member/profile", icon: "User" },
  ];

  if (!user) return null;

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 border-b md:hidden border-border bg-surface">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/homepage")}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Icon name="Home" size={16} color="white" />
          </div>
          <span className="ml-2 text-base font-semibold text-text-primary">
            Member
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
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`transition-all duration-200 p-4 border-r border-border bg-surface z-20
          md:block ${collapsed ? "md:w-24" : "md:w-64"}
          ${isMobileOpen ? "fixed inset-y-0 left-0 w-64 shadow-2xl" : "hidden"}
        `}
        >
          <div className="flex items-center justify-between mb-8">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                navigate("/homepage");
                closeMobileMenu();
              }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                <Icon name="Home" size={18} color="white" />
              </div>
              {(!collapsed || isMobileOpen) && (
                <span className="ml-3 text-lg font-semibold text-text-primary">
                  EstateHub Member
                </span>
              )}
            </div>

            <button
              onClick={() => setCollapsed((s) => !s)}
              className="hidden p-2 rounded hover:bg-secondary-100 md:block"
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
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? "md:justify-center" : ""
                  } p-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary-100 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                  }`
                }
              >
                <Icon name={it.icon} size={20} />
                {(!collapsed || isMobileOpen) && (
                  <span className="ml-3">{it.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8">
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

        {/* Main Content */}
        <div className="flex-1 min-h-screen p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberLayout;
