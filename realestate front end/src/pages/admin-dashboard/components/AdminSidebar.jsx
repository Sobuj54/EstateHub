// src/pages/admin/components/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import Icon from "components/AppIcon";

const links = [
  { path: "dashboard", label: "Dashboard", icon: "Home" },
  { path: "agents", label: "Agents", icon: "User" },
  { path: "members", label: "Members", icon: "Users" },
  { path: "properties", label: "Properties", icon: "Building2" },
  { path: "settings", label: "Settings", icon: "Settings" },
];

const AdminSidebar = () => {
  return (
    <aside className="hidden w-64 min-h-screen px-6 pt-24 bg-white shadow-lg lg:block">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-primary/10"
              }`
            }
          >
            <Icon name={link.icon} size={18} className="mr-3" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
