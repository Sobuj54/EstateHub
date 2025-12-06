import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const PropertyCard = ({
  property,
  variant = "card",
  onSave,
  isHighlighted = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Updated real estate images from multiple stock photography platforms
  const updatedImages = [
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    "https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    "https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
  ];

  // Use updated images if property images are outdated or from common old sources
  const shouldUpdateImages = property?.images?.some(
    (img) =>
      img?.includes("photo-1545324418-cc1a3fa10c00") ||
      img?.includes("photo-1396122") ||
      img?.includes("photo-1438832") ||
      img?.includes("kitchen-1336160") ||
      img?.includes("very-old-image-urls") ||
      !img?.includes("w=800") // Check if image doesn't have proper sizing parameters
  );

  const displayImages = shouldUpdateImages
    ? updatedImages
    : property?.images || updatedImages;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(property?.id, !property?.isSaved);
    }
  };

  const handleImageNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === displayImages?.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? displayImages?.length - 1 : prev - 1
      );
    }
  };

  const handleContactAgent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle contact agent action
    window.open(`tel:${property?.agent?.phone}`, "_self");
  };

  if (variant === "list") {
    return (
      <div
        className={`block card hover:shadow-elevation-2 transition-all duration-200 ease-out
                   ${
                     isHighlighted
                       ? "ring-2 ring-primary shadow-elevation-2"
                       : ""
                   }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          <div className="flex space-x-4">
            {/* Property Images */}
            <div className="relative flex-shrink-0 w-48 h-32 overflow-hidden rounded-md">
              <Image
                src={displayImages?.[currentImageIndex]}
                alt={property?.title}
                className="object-cover w-full h-full"
              />

              {/* Image Navigation */}
              {displayImages?.length > 1 && isHovered && (
                <>
                  <button
                    onClick={(e) => handleImageNavigation("prev", e)}
                    className="absolute flex items-center justify-center w-6 h-6 transition-all duration-200 transform -translate-y-1/2 rounded-full left-2 top-1/2 bg-surface/90 hover:bg-surface"
                  >
                    <Icon name="ChevronLeft" size={14} />
                  </button>
                  <button
                    onClick={(e) => handleImageNavigation("next", e)}
                    className="absolute flex items-center justify-center w-6 h-6 transition-all duration-200 transform -translate-y-1/2 rounded-full right-2 top-1/2 bg-surface/90 hover:bg-surface"
                  >
                    <Icon name="ChevronRight" size={14} />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {displayImages?.length > 1 && (
                <div className="absolute flex space-x-1 transform -translate-x-1/2 bottom-2 left-1/2">
                  {displayImages?.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                           transition-all duration-200 ease-out ${
                             property?.isSaved
                               ? "bg-error text-white"
                               : "bg-surface/90 text-text-secondary hover:bg-surface hover:text-error"
                           }`}
              >
                <Icon
                  name="Heart"
                  size={16}
                  fill={property?.isSaved ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Property Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold truncate text-text-primary">
                    {property?.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property?.price)}
                  </p>
                </div>

                {property?.daysOnMarket <= 7 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-md bg-success-100 text-success">
                    New
                  </span>
                )}
              </div>

              <p className="mb-3 text-sm truncate text-text-secondary">
                {property?.address}
              </p>

              {/* Property Features */}
              <div className="flex items-center mb-3 space-x-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="Bed" size={16} />
                  <span>{property?.bedrooms} bed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Bath" size={16} />
                  <span>{property?.bathrooms} bath</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Square" size={16} />
                  <span>{formatNumber(property?.sqft)} sqft</span>
                </div>
              </div>

              {/* Agent Info & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={property?.agent?.avatar}
                    alt={property?.agent?.name}
                    className="object-cover w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-text-secondary">
                    {property?.agent?.name}
                  </span>
                </div>

                {isHovered && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleContactAgent}
                      className="px-3 py-1.5 bg-accent-100 text-accent-600 rounded-md text-sm font-medium hover:bg-accent-500 hover:text-white transition-all duration-200 ease-out"
                    >
                      Contact
                    </button>
                    <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200 ease-out">
                      Tour
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card variant for mobile/grid view
  return (
    <div className="block transition-all duration-200 ease-out card hover:shadow-elevation-2 micro-interaction">
      {/* Property Images */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={displayImages?.[currentImageIndex]}
          alt={property?.title}
          className="object-cover w-full h-full"
        />

        {/* Image Navigation */}
        {displayImages?.length > 1 && (
          <>
            <button
              onClick={(e) => handleImageNavigation("prev", e)}
              className="absolute flex items-center justify-center w-8 h-8 transition-all duration-200 transform -translate-y-1/2 rounded-full left-2 top-1/2 bg-surface/90 hover:bg-surface"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={(e) => handleImageNavigation("next", e)}
              className="absolute flex items-center justify-center w-8 h-8 transition-all duration-200 transform -translate-y-1/2 rounded-full right-2 top-1/2 bg-surface/90 hover:bg-surface"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {displayImages?.length > 1 && (
          <div className="absolute flex space-x-1 transform -translate-x-1/2 bottom-3 left-1/2">
            {displayImages?.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center
                     transition-all duration-200 ease-out ${
                       property?.isSaved
                         ? "bg-error text-white"
                         : "bg-surface/90 text-text-secondary hover:bg-surface hover:text-error"
                     }`}
        >
          <Icon
            name="Heart"
            size={18}
            fill={property?.isSaved ? "currentColor" : "none"}
          />
        </button>

        {/* New Badge */}
        {property?.daysOnMarket <= 7 && (
          <div className="absolute px-2 py-1 text-xs font-medium text-white rounded-md top-3 left-3 bg-success">
            New
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate text-text-primary">
              {property?.title}
            </h3>
            <p className="text-xl font-bold text-primary">
              {formatPrice(property?.price)}
            </p>
          </div>
        </div>

        <p className="mb-3 text-sm truncate text-text-secondary">
          {property?.address}
        </p>

        {/* Property Features */}
        <div className="flex items-center mb-4 space-x-4 text-sm text-text-secondary">
          <div className="flex items-center space-x-1">
            <Icon name="Bed" size={16} />
            <span>{property?.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Bath" size={16} />
            <span>{property?.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Square" size={16} />
            <span>{formatNumber(property?.sqft)} sqft</span>
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Image
              src={property?.agent?.avatar}
              alt={property?.agent?.name}
              className="object-cover w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {property?.agent?.name}
              </p>
              <p className="text-xs text-text-secondary">
                {property?.agent?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleContactAgent}
              className="p-2 transition-all duration-200 ease-out rounded-md bg-accent-100 text-accent-600 hover:bg-accent-500 hover:text-white"
            >
              <Icon name="Phone" size={16} />
            </button>
            <button className="p-2 text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700">
              <Icon name="Calendar" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
