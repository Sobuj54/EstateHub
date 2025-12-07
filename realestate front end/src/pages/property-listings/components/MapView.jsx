import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const MapView = ({
  properties = [],
  selectedProperty,
  onPropertySelect,
  isMobile = false,
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [zoom, setZoom] = useState(11);
  const [hoveredProperty, setHoveredProperty] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate map bounds based on properties
  useEffect(() => {
    if (properties.length > 0) {
      const lats = properties.map((p) => p.coordinates.lat);
      const lngs = properties.map((p) => p.coordinates.lng);

      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [properties]);

  const handleMarkerClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 8));
  };

  return (
    <div className="relative h-full bg-secondary-100">
      {/* Map Container */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Google Maps Iframe */}
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Property Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoom}&output=embed`}
          className="absolute inset-0"
        />

        {/* Property Markers Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {properties.map((property) => {
            // Calculate marker position (simplified positioning)
            const markerStyle = {
              position: "absolute",
              left: `${20 + ((property.id * 15) % 60)}%`,
              top: `${20 + ((property.id * 12) % 60)}%`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "auto",
            };

            return (
              <div key={property.id} style={markerStyle} className="relative">
                {/* Price Marker */}
                <button
                  onClick={() => handleMarkerClick(property)}
                  onMouseEnter={() => setHoveredProperty(property)}
                  onMouseLeave={() => setHoveredProperty(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-elevation-2
                           transition-all duration-200 ease-out micro-interaction ${
                             selectedProperty?.id === property.id
                               ? "bg-primary text-white scale-110"
                               : hoveredProperty?.id === property.id
                               ? "bg-accent text-white scale-105"
                               : "bg-surface text-text-primary hover:bg-primary hover:text-white"
                           }`}
                >
                  {formatPrice(property.price).replace(".00", "")}
                </button>

                {/* Property Card Popup */}
                {(hoveredProperty?.id === property.id ||
                  selectedProperty?.id === property.id) && (
                  <div className="absolute w-64 mb-2 transform -translate-x-1/2 border rounded-lg bottom-full left-1/2 bg-surface shadow-elevation-4 border-border z-dropdown">
                    <div className="p-3">
                      {/* Property Image */}
                      <div className="relative h-32 mb-3 overflow-hidden rounded-md">
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute p-1 rounded-full top-2 right-2 bg-surface/90">
                          <Icon
                            name={property.isSaved ? "Heart" : "Heart"}
                            size={14}
                            className={
                              property.isSaved
                                ? "text-error"
                                : "text-text-secondary"
                            }
                            fill={property.isSaved ? "currentColor" : "none"}
                          />
                        </div>
                      </div>

                      {/* Property Details */}
                      <div>
                        <h4 className="mb-1 text-sm font-semibold truncate text-text-primary">
                          {property.title}
                        </h4>
                        <p className="mb-2 text-lg font-bold text-primary">
                          {formatPrice(property.price)}
                        </p>
                        <p className="mb-2 text-xs truncate text-text-secondary">
                          {property.address}
                        </p>

                        {/* Property Features */}
                        <div className="flex items-center mb-3 space-x-3 text-xs text-text-secondary">
                          <div className="flex items-center space-x-1">
                            <Icon name="Bed" size={12} />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Bath" size={12} />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Square" size={12} />
                            <span>{property.sqft}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            className="flex-1 bg-primary text-white px-3 py-1.5 rounded-md 
                                           text-xs font-medium hover:bg-primary-700 
                                           transition-colors duration-200"
                          >
                            View Details
                          </button>
                          <button
                            className="px-2 py-1.5 bg-secondary-100 text-text-secondary 
                                           rounded-md hover:bg-secondary-200 
                                           transition-colors duration-200"
                          >
                            <Icon name="Phone" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Popup Arrow */}
                    <div className="absolute transform -translate-x-1/2 top-full left-1/2">
                      <div className="w-0 h-0 border-t-4 border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-border"></div>
                      <div className="relative w-0 h-0 border-t-4 border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-surface -top-px"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute flex flex-col space-y-2 top-4 right-4">
          {/* Zoom Controls */}
          <div className="overflow-hidden border rounded-md bg-surface shadow-elevation-2 border-border">
            <button
              onClick={handleZoomIn}
              className="flex items-center justify-center w-10 h-10 transition-colors duration-200  text-text-secondary hover:text-text-primary hover:bg-secondary-100"
            >
              <Icon name="Plus" size={16} />
            </button>
            <div className="border-t border-border"></div>
            <button
              onClick={handleZoomOut}
              className="flex items-center justify-center w-10 h-10 transition-colors duration-200  text-text-secondary hover:text-text-primary hover:bg-secondary-100"
            >
              <Icon name="Minus" size={16} />
            </button>
          </div>

          {/* Map Type Toggle */}
          <button className="flex items-center justify-center w-10 h-10 transition-colors duration-200 border rounded-md bg-surface shadow-elevation-2 border-border text-text-secondary hover:text-text-primary hover:bg-secondary-100">
            <Icon name="Layers" size={16} />
          </button>

          {/* Current Location */}
          <button className="flex items-center justify-center w-10 h-10 transition-colors duration-200 border rounded-md bg-surface shadow-elevation-2 border-border text-text-secondary hover:text-text-primary hover:bg-secondary-100">
            <Icon name="Navigation" size={16} />
          </button>
        </div>

        {/* Search This Area Button */}
        <div className="absolute transform -translate-x-1/2 top-4 left-1/2">
          <button className="px-4 py-2 text-sm font-medium transition-all duration-200 ease-out border rounded-full bg-surface text-text-primary shadow-elevation-2 border-border hover:bg-secondary-100 micro-interaction">
            <Icon name="Search" size={14} className="inline mr-2" />
            Search this area
          </button>
        </div>

        {/* Property Count Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-2 text-sm font-medium border rounded-full bg-surface text-text-primary shadow-elevation-2 border-border">
            {properties.length} properties
          </div>
        </div>

        {/* Mobile: Back to List Button */}
        {isMobile && (
          <div className="absolute bottom-4 right-4">
            <button className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out rounded-full bg-primary shadow-elevation-2 hover:bg-primary-700 micro-interaction">
              <Icon name="List" size={14} className="inline mr-2" />
              Back to List
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {properties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-sm text-text-secondary">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
