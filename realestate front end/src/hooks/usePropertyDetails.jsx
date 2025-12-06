// src/hooks/usePropertyDetailsQuery.js

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const url = import.meta.env.VITE_API; // Get your base API URL

/**
 * Custom hook to fetch the details for a single property by its ID.
 * @param {string} propertyId - The unique ID of the property.
 */
export const usePropertyDetailsQuery = (propertyId) => {
  const fetchPropertyDetails = async () => {
    if (!propertyId) return null;

    // API endpoint is {{server}}/properties/:id
    const response = await axios.get(`${url}/properties/${propertyId}`);
    const fetchedData = response.data.data;

    // Check if data exists before processing
    if (!fetchedData) throw new Error("Property data is empty.");

    const agentData = fetchedData.agent || {};

    // ⭐️ Data mapping and setting robust defaults
    const propertyWithDefaults = {
      ...fetchedData,
      id: fetchedData._id,
      // Fallbacks for PropertyOverview/PropertyTabs
      yearBuilt: fetchedData.yearBuilt || "N/A",
      lotSize: fetchedData.lotSize || "N/A",
      parkingSpaces: fetchedData.parkingSpaces || 0,
      daysOnMarket: fetchedData.daysOnMarket || 1,
      mls: fetchedData.mls || "N/A",
      virtualTour: fetchedData.virtualTour || null,
      video: fetchedData.video || null,
      amenities: fetchedData.amenities || [],

      // Agent fields (ensuring non-existent fields have defaults)
      agent: {
        name: agentData.name || "EstateHub Agent",
        email: agentData.email || "support@estatehub.com",
        avatar:
          agentData.avatar || "https://via.placeholder.com/150?text=Agent",
        phone: agentData.phone || "(555) 555-5555",
        rating: agentData.rating || 4.0,
        reviewsCount: agentData.reviewsCount || 10,
        bio:
          agentData.bio ||
          `A dedicated professional committed to serving your real estate needs.`,
      },
    };

    return propertyWithDefaults;
  };

  return useQuery({
    queryKey: ["property-details", propertyId],
    queryFn: fetchPropertyDetails,
    // Only run the query if 'propertyId' is truthy
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 2, // Retry failed queries twice
  });
};
