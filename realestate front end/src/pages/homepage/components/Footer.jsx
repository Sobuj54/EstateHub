import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "For Buyers",
      links: [
        { label: "Search Properties", path: "/property-listings" },
        { label: "Mortgage Calculator", path: "/mortgage-calculator" },
        { label: "Buyer's Guide", path: "/buyers-guide" },
        { label: "Neighborhood Info", path: "/neighborhoods" },
      ],
    },
    {
      title: "For Sellers",
      links: [
        { label: "List Your Property", path: "/list-property" },
        { label: "Home Valuation", path: "/home-valuation" },
        { label: "Seller's Guide", path: "/sellers-guide" },
        { label: "Market Reports", path: "/market-reports" },
      ],
    },
    {
      title: "For Agents",
      links: [
        { label: "Agent Dashboard", path: "/agent-dashboard" },
        { label: "Join Our Team", path: "/join-team" },
        { label: "Agent Resources", path: "/agent-resources" },
        { label: "Training Center", path: "/training" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Contact", path: "/contact" },
        { label: "Careers", path: "/careers" },
        { label: "Press", path: "/press" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: "Facebook", url: "https://facebook.com" },
    { name: "Twitter", icon: "Twitter", url: "https://twitter.com" },
    { name: "Instagram", icon: "Instagram", url: "https://instagram.com" },
    { name: "LinkedIn", icon: "Linkedin", url: "https://linkedin.com" },
  ];

  return (
    <footer className="text-white bg-secondary-700">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4 space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                  <Icon name="Home" size={20} color="white" />
                </div>
                <span className="text-xl font-semibold font-heading">
                  EstateHub
                </span>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-secondary-300 sm:text-base">
                Your trusted partner in real estate. We connect buyers, sellers,
                and agents to create successful property transactions across the
                country.
              </p>

              {/* Contact Info */}
              <div className="mb-6 space-y-2 text-sm sm:text-base">
                <div className="flex items-center space-x-2 text-secondary-300">
                  <Icon name="Phone" size={16} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-secondary-300">
                  <Icon name="Mail" size={16} />
                  <span>info@estatehub.com</span>
                </div>
                <div className="flex items-center space-x-2 text-secondary-300">
                  <Icon name="MapPin" size={16} />
                  <span>123 Real Estate Ave, City, State 12345</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3 sm:space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center transition-all duration-200 ease-out rounded-full w-9 h-9 sm:w-10 sm:h-10 bg-secondary-600 hover:bg-primary micro-interaction"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon name={social.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-base font-semibold text-white sm:text-lg sm:mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="transition-colors duration-200 text-secondary-300 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-secondary-600">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="">
              <h3 className="mb-1 text-base font-semibold sm:text-lg sm:mb-2">
                Stay Updated
              </h3>
              <p className="text-sm text-secondary-300 sm:text-base">
                Get the latest property listings and market insights delivered
                to your inbox.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 text-white transition-all duration-200 border rounded-md sm:flex-none sm:w-64 bg-secondary-600 border-secondary-500 sm:rounded-r-none placeholder-secondary-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button className="px-6 py-2 font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary sm:rounded-l-none sm:rounded-r-md hover:bg-primary-700 micro-interaction">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-secondary-600">
          <div className="flex flex-col items-center justify-between gap-2 text-sm sm:flex-row sm:gap-0 text-secondary-300">
            <div>© {currentYear} EstateHub. All rights reserved.</div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 sm:justify-start sm:gap-6 sm:mt-0">
              <Link
                to="/privacy"
                className="transition-colors duration-200 hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="transition-colors duration-200 hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="transition-colors duration-200 hover:text-white"
              >
                Cookie Policy
              </Link>
              <Link
                to="/accessibility"
                className="transition-colors duration-200 hover:text-white"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
