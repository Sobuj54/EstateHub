import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Mock user data - in real app this would come from context/props
  const user = {
    isAuthenticated: true,
    role: "agent", // 'buyer', 'seller', 'agent\'name: \'John Smith',
    avatar: "/assets/images/avatar.jpg",
    name: "John Smith",
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to property listings with search query
      window.location.href = `/property-listings?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  const handleUserAction = (action) => {
    if (action === "logout") {
      // Handle logout logic
      console.log("Logging out...");
    }
    setIsUserMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const shouldShowNavItem = (roles) => {
    return roles.includes("all") || roles.includes(user.role);
  };

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-surface border-border z-header">
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
          <nav className="items-center hidden space-x-6 md:flex">
            {navigationItems.map(
              (item) =>
                shouldShowNavItem(item.roles) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium 
                           transition-all duration-200 ease-out micro-interaction
                           ${
                             isActiveRoute(item.path)
                               ? "bg-primary-100 text-primary border border-primary-500"
                               : "text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                           }`}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
            )}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user.isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 space-x-2 transition-all duration-200 ease-out rounded-md hover:bg-secondary-100 micro-interaction"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                    <span className="text-sm font-medium text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
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
                        {user.name}
                      </p>
                      <p className="text-xs capitalize text-text-secondary">
                        {user.role}
                      </p>
                    </div>
                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <div key={item.label}>
                          {item.path ? (
                            <Link
                              to={item.path}
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
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 micro-interaction"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            {navigationItems.map(
              (item) =>
                shouldShowNavItem(item.roles) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium 
                           transition-all duration-200 ease-out
                           ${
                             isActiveRoute(item.path)
                               ? "bg-primary-100 text-primary border border-primary-500"
                               : "text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                           }`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
