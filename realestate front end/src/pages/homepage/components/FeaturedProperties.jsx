import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import axios from "axios";

const fetchFeaturedProperties = async () => {
  const url = import.meta.env.VITE_API;
  const response = await axios.get(`${url}/properties`, {
    params: { limit: 6 },
  });

  return response.data.data;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const FeaturedProperties = () => {
  const [savedProperties, setSavedProperties] = useState(new Set());

  const {
    data: featuredProperties,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["featuredProperties"],
    queryFn: fetchFeaturedProperties,
    // Optional: Keep the data fresh for a short time
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSaveProperty = (propertyId) => {
    // NOTE: In a real app, this action would trigger an API call
    // and an optimistic update/invalidation using mutation.
    setSavedProperties((prev) => {
      const newSaved = new Set(prev);
      if (newSaved.has(propertyId)) {
        newSaved.delete(propertyId);
      } else {
        newSaved.add(propertyId);
      }
      return newSaved;
    });
  };

  // --- Loading State ---
  // We can reuse the skeleton logic from your main Homepage component
  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-text-primary font-heading">
              Featured Properties
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-text-secondary">
              Loading properties, please wait...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg bg-surface shadow-elevation-1"
              >
                <div className="h-48 bg-secondary-100 skeleton"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded bg-secondary-100 skeleton"></div>
                  <div className="w-3/4 h-4 rounded bg-secondary-100 skeleton"></div>
                  <div className="w-1/2 h-4 rounded bg-secondary-100 skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <section className="py-16 text-center lg:py-24 bg-background">
        <p className="text-xl text-error">
          Error loading properties: {error.message}
        </p>
      </section>
    );
  }

  // Handle case where data is successfully fetched but the array is empty
  if (!featuredProperties || featuredProperties.length === 0) {
    return (
      <section className="py-16 text-center lg:py-24 bg-background">
        <p className="text-xl text-text-secondary">
          No featured properties found at this time.
        </p>
      </section>
    );
  }

  // --- Success State (Rendering) ---
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-text-primary font-heading">
            Featured Properties
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-text-secondary">
            Discover our handpicked selection of premium properties from top
            locations across the country
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featuredProperties.map((property) => (
            <div
              key={property._id} // Use the MongoDB _id for key
              className="overflow-hidden transition-all duration-300 ease-out rounded-lg bg-surface shadow-elevation-1 hover:shadow-elevation-3 micro-interaction group"
            >
              {/* Property Image */}
              <div className="relative h-48 overflow-hidden lg:h-56">
                <Image
                  // Use the first image from the array, or a placeholder if the array is empty
                  src={property.images?.[0] || "placeholder-url.jpg"}
                  alt={property.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />

                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium text-white rounded-md bg-primary">
                    {property.propertyType}{" "}
                    {/* Changed from property.type to property.propertyType */}
                  </span>
                </div>

                {/* Save Button (uses property._id now) */}
                <button
                  onClick={() => handleSaveProperty(property._id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200
                             ${
                               savedProperties.has(property._id)
                                 ? "bg-error text-white"
                                 : "bg-white/90 text-text-secondary hover:bg-white hover:text-error"
                             }`}
                  aria-label={
                    savedProperties.has(property._id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Icon
                    name="Heart"
                    size={16}
                    fill={
                      savedProperties.has(property._id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                {/* New Listing Badge (Assuming daysOnMarket is returned) */}
                {/* NOTE: If daysOnMarket is not in the API response, this must be removed/recalculated */}
                {property.daysOnMarket && property.daysOnMarket <= 7 && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium text-white rounded-md bg-success">
                      New Listing
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-4 lg:p-6">
                <div className="mb-3">
                  <h3 className="mb-1 text-lg font-semibold transition-colors text-text-primary group-hover:text-primary">
                    {property.title}
                  </h3>
                  <p className="flex items-center text-sm text-text-secondary">
                    <Icon name="MapPin" size={14} className="mr-1" />
                    {property.address}{" "}
                    {/* Changed from property.location to property.address */}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                </div>

                {/* Property Features */}
                <div className="flex items-center justify-between mb-4 text-sm text-text-secondary">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Icon name="Bed" size={14} className="mr-1" />
                      {property.bedrooms} bed
                    </span>
                    <span className="flex items-center">
                      <Icon name="Bath" size={14} className="mr-1" />
                      {property.bathrooms} bath
                    </span>
                    <span className="flex items-center">
                      <Icon name="Square" size={14} className="mr-1" />
                      {property.sqft?.toLocaleString() || "N/A"} sqft
                    </span>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={property.agent.avatar || "default-avatar.jpg"} // Assuming agent is populated and uses 'avatar'
                      alt={property.agent.name || "Agent"}
                      className="object-cover w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-text-secondary">
                      {property.agent.name || "Unknown Agent"}
                    </span>
                  </div>

                  <Link
                    to={`/property-details/${property._id}`} // Use property._id for cleaner routing
                    className="text-sm font-medium transition-colors text-primary hover:text-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/property-listings"
            className="inline-flex items-center px-8 py-3 font-semibold text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 micro-interaction"
          >
            View All Properties
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
