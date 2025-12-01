import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import useAuthContext from "hooks/useAuthContext";
import { toast, ToastContainer } from "react-toastify";
import useAxiosSecure from "hooks/useAxiosSecure";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const axiosSecure = useAxiosSecure();

  const { user, setUser, setToken, setLoading, loading } = useAuthContext();

  const navigationItems = [
    {
      label: "Search Properties",
      path: "/property-listings",
      icon: "Search",
      roles: ["all"],
    },
    {
      label: "Dashboard",
      path: "/agent-dashboard",
      icon: "LayoutDashboard",
      roles: ["agent"],
    },
  ];

  const userMenuItems = [
    {
      label: "Dashboard",
      action: "dashboard",
      icon: "LayoutDashboard",
    },
    {
      label: "Profile & Settings",
      path: "/user-profile-settings",
      icon: "User",
    },
    {
      label: "Saved Properties",
      path: "/saved-properties",
      icon: "Heart",
    },
    {
      label: "Sign Out",
      action: "logout",
      icon: "LogOut",
    },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle mobile menu"]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/property-listings?search=${encodeURIComponent(searchQuery.trim())}`
      );
    } else {
      navigate("/property-listings");
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axiosSecure.post("/auth/logout");
      setUser(null);
      setToken(null);
      setLoading(false);
      navigate("/");
      toast.success("Logout Successful!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      setLoading(false);
      toast.error("Logout Failed.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleUserAction = async (action) => {
    if (action === "logout") {
      if (typeof logout === "function") {
        await logout();
        setIsUserMenuOpen(false);
      }
      return;
    }

    if (action === "dashboard") {
      // Navigate to role-specific dashboard
      const role = user?.role;
      let dashboardPath = "/"; // default fallback
      if (role === "agent") dashboardPath = "/agent-dashboard";
      else if (role === "member") dashboardPath = "/member-dashboard";
      else if (role === "admin") dashboardPath = "/admin/dashboard";
      else if (role === "super_admin") dashboardPath = "/super-admin-dashboard";

      navigate(dashboardPath);
      setIsUserMenuOpen(false);
      return;
    }

    setIsUserMenuOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  // decide if a navigation item should be shown for current user
  const shouldShowNavItem = (roles = []) => {
    if (!roles || roles.length === 0) return true;
    if (roles.includes("all")) return true;
    // if user not logged in, treat them as guest with no special roles
    const role = user?.role || "guest";
    return roles.includes(role);
  };

  // render user avatar or initials
  const renderAvatar = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={`${user.name}'s avatar`}
          className="object-cover w-full h-full rounded-full"
          onError={(e) => {
            // fallback to initials if image fails
            e.currentTarget.onerror = null;
            e.currentTarget.src = "";
          }}
        />
      );
    }

    // initials fallback
    const initials = (user?.name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <span className="text-sm font-medium text-white">{initials || "U"}</span>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-surface border-border z-header">
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
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/homepage"
              className="flex items-center space-x-2 micro-interaction"
              aria-label="EstateHub - Go to homepage"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Icon name="Home" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary font-heading">
                EstateHub
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 hidden max-w-lg mx-8 md:flex">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon
                    name="Search"
                    size={20}
                    className={`transition-colors duration-200 ${
                      isSearchFocused ? "text-primary" : "text-secondary"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search properties by location, type, or price..."
                  className="block w-full py-2 pl-10 pr-4 transition-all duration-200 ease-out border rounded-md border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-background text-text-primary placeholder-text-secondary"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="items-center hidden space-x-6 md:flex"
            aria-label="Main navigation"
          >
            {navigationItems.map((item) =>
              shouldShowNavItem(item.roles) ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out micro-interaction ${
                    isActiveRoute(item.path)
                      ? "bg-primary-100 text-primary border border-primary-500"
                      : "text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              ) : null
            )}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {loading ? (
              <div className="flex items-center space-x-2">
                {/* Avatar skeleton */}
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                {/* Name skeleton */}
                <div className="w-2 h-4 bg-gray-300 rounded-md animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((s) => !s)}
                  className="flex items-center p-2 space-x-2 transition-all duration-200 ease-out rounded-md hover:bg-secondary-100 micro-interaction"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="flex items-center justify-center w-8 h-8 overflow-hidden rounded-full bg-primary">
                    {renderAvatar()}
                  </div>
                  <span className="sr-only">Open user menu</span>
                  <Icon
                    name="ChevronDown"
                    size={16}
                    className={`transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 w-56 mt-2 border rounded-md bg-surface shadow-elevation-3 border-border z-dropdown">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">
                        {user?.name}
                      </p>
                      <p className="text-xs capitalize text-text-secondary">
                        {user?.role}
                      </p>
                      <p className="text-xs truncate text-text-secondary">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <div key={item.label}>
                          {item.path ? (
                            <Link
                              to={item.path}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 space-x-3 text-sm transition-colors duration-200 text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                            >
                              <Icon name={item.icon} size={16} />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleUserAction(item.action)}
                              className="flex items-center w-full px-4 py-2 space-x-3 text-sm transition-colors duration-200 text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                            >
                              <Icon name={item.icon} size={16} />
                              <span>{item.label}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium transition-colors duration-200 text-text-secondary hover:text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 micro-interaction"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((s) => !s)}
              className="p-2 transition-all duration-200 ease-out rounded-md md:hidden text-text-secondary hover:text-text-primary hover:bg-secondary-100"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-4 md:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon name="Search" size={20} className="text-secondary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="block w-full py-2 pl-10 pr-4 transition-all duration-200 ease-out border rounded-md border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500 bg-background text-text-primary placeholder-text-secondary"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="border-t md:hidden bg-surface border-border z-mobile-menu"
        >
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map((item) =>
              shouldShowNavItem(item.roles) ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ease-out ${
                    isActiveRoute(item.path)
                      ? "bg-primary-100 text-primary border border-primary-500"
                      : "text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </Link>
              ) : null
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
