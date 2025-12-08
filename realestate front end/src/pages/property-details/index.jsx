// src/pages/property-details/index.jsx

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import Image from "../../components/AppImage";

import ImageGallery from "./components/ImageGallery";
import PropertyOverview from "./components/PropertyOverview";
import PropertyTabs from "./components/PropertyTabs";
import MortgageCalculator from "./components/MortgageCalculator";
import ContactForm from "./components/ContactForm";
import SimilarProperties from "./components/SimilarProperties";
import LoadingState from "./components/LoadingState";
import { Helmet } from "react-helmet";
import { usePropertyDetailsQuery } from "hooks/usePropertyDetails";
import useAuthContext from "hooks/useAuthContext";
import useAxiosSecure from "hooks/useAxiosSecure";

const PropertyDetails = () => {
  const { id: propertyId } = useParams();
  const { user } = useAuthContext();
  const axiosSecure = useAxiosSecure();

  const {
    data: property,
    isLoading,
    isError,
  } = usePropertyDetailsQuery(propertyId);

  const [activeTab, setActiveTab] = useState("description");
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Mutation to save property
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.info("You must be logged in to save properties.");
        throw new Error("User not logged in");
      }

      const res = await axiosSecure.post("/saved-properties", {
        propertyId: property._id,
        userId: user._id,
      });

      return res.data;
    },
    onSuccess: () => {
      setIsSaved(true);
      toast.success("Property saved successfully!");
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to save property";
      toast.error(message);
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!");
    }
  };

  const getBreadcrumbs = () => [
    { label: "Home", path: "/homepage" },
    { label: "Properties", path: "/property-listings" },
    { label: property?.title || "Property Details", path: null },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingState />
      </div>
    );
  }

  if (!property || isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 lg:pt-18">
          <div className="px-4 py-12 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <Icon
              name="Home"
              size={64}
              className="mx-auto mb-4 text-secondary"
            />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {isError ? "Error Loading Property" : "Property Not Found"}
            </h1>
            <p className="mb-6 text-text-secondary">
              The property you're looking for doesn't exist or there was a
              network error.
            </p>
            <Link
              to="/property-listings"
              className="inline-flex items-center px-6 py-3 space-x-2 text-white transition-all duration-200 rounded-md bg-primary hover:bg-primary-700"
            >
              <Icon name="ArrowLeft" size={16} />
              <span>Back to Properties</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const similarProperties = [
    {
      id: 2,
      title: "Luxury Suburban House",
      price: 750000,
      address: "456 Oak Avenue, Westfield, NJ 07090",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      images: [
        "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>EstateHub | {property.title}</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20 lg:pt-18">
          {/* Breadcrumb */}
          <div className="border-b bg-surface border-border">
            <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <nav className="flex items-center space-x-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <Icon
                        name="ChevronRight"
                        size={14}
                        className="text-text-secondary"
                      />
                    )}
                    {crumb.path ? (
                      <Link
                        to={crumb.path}
                        className="transition-colors duration-200 text-text-secondary hover:text-text-primary"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-medium truncate text-text-primary">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Actions Bar */}
          <div className="sticky z-10 border-b lg:hidden bg-surface border-border top-16">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isLoading}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isSaved
                      ? "bg-success text-white"
                      : "bg-secondary-100 text-text-secondary hover:bg-primary hover:text-white"
                  }`}
                >
                  <Icon
                    name="Heart"
                    size={18}
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 transition-all duration-200 rounded-md bg-secondary-100 text-text-secondary hover:bg-secondary-200"
                >
                  <Icon name="Share" size={18} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-md bg-accent hover:bg-accent-600"
                >
                  Contact Agent
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-md bg-primary hover:bg-primary-700">
                  Schedule Tour
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <ImageGallery
                  images={property.images}
                  title={property.title}
                  virtualTour={property.virtualTour}
                  video={property.video}
                />
                <PropertyOverview
                  property={property}
                  isSaved={isSaved}
                  onSave={() => saveMutation.mutate()}
                  onShare={handleShare}
                  onContact={() => setShowContactForm(true)}
                />
                <PropertyTabs
                  property={property}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              <div className="space-y-6">
                <div className="hidden lg:block">
                  <MortgageCalculator propertyPrice={property.price} />
                </div>

                <div className="lg:hidden">
                  <button
                    onClick={() =>
                      setShowMortgageCalculator(!showMortgageCalculator)
                    }
                    className="flex items-center justify-between w-full p-4 transition-all duration-200 border rounded-lg bg-surface border-border hover:shadow-elevation-2"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        name="Calculator"
                        size={20}
                        className="text-primary"
                      />
                      <span className="font-medium text-text-primary">
                        Mortgage Calculator
                      </span>
                    </div>
                    <Icon
                      name="ChevronDown"
                      size={16}
                      className={`text-text-secondary transition-transform duration-200 ${
                        showMortgageCalculator ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showMortgageCalculator && (
                    <div className="mt-4">
                      <MortgageCalculator propertyPrice={property.price} />
                    </div>
                  )}
                </div>

                <div className="p-6 card">
                  <div className="flex items-center mb-4 space-x-4">
                    <Image
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      className="object-cover w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">
                        {property.agent.name}
                      </h3>
                      <div className="flex items-center mb-1 space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="Star"
                              size={14}
                              className={
                                i < Math.floor(property.agent.rating)
                                  ? "text-warning fill-current"
                                  : "text-secondary-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-text-secondary">
                          {property.agent.rating} ({property.agent.reviewsCount}{" "}
                          reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-text-secondary">
                    {property.agent.bio}
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="flex items-center justify-center w-full py-3 space-x-2 text-white transition-all duration-200 rounded-md bg-primary hover:bg-primary-700"
                    >
                      <Icon name="MessageCircle" size={16} />
                      <span>Send Message</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center py-2 space-x-2 transition-all duration-200 rounded-md bg-accent-100 text-accent-600 hover:bg-accent hover:text-white">
                        <Icon name="Phone" size={16} />
                        <span className="text-sm">Call</span>
                      </button>
                      <button className="flex items-center justify-center py-2 space-x-2 transition-all duration-200 rounded-md bg-secondary-100 text-text-secondary hover:bg-secondary-200">
                        <Icon name="Calendar" size={16} />
                        <span className="text-sm">Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <SimilarProperties properties={similarProperties} />
            </div>
          </div>
        </main>

        {showContactForm && (
          <ContactForm
            property={property}
            agent={property.agent}
            onClose={() => setShowContactForm(false)}
          />
        )}
      </div>
    </>
  );
};

export default PropertyDetails;
