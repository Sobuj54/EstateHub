import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "hooks/useAxiosSecure";

// MOCK data updated to match the API structure for consistent fallbacks
const MOCK = {
  stats: {
    totalAgents: 12,
    totalMembers: 50,
    totalProperties: 120,
    propertiesThisMonth: 8,
    newMembers: 5,
  },
  recentProperties: [
    {
      _id: "mock-p1",
      title: "Luxury Villa (MOCK)",
      agent: { name: "John Smith" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "mock-p2",
      title: "Modern Apartment (MOCK)",
      agent: { name: "Jane Doe" },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  topAgents: [
    { _id: "mock-a1", name: "John Smith", propertiesCount: 20 },
    { _id: "mock-a2", name: "Jane Doe", propertiesCount: 15 },
  ],
};

/**
 * Custom hook to fetch and manage admin dashboard summary data using TanStack Query.
 * @param {boolean} mockMode - If true, uses MOCK data instead of API.
 * @returns {object} - Data, loading state, and error state from useQuery.
 */
const useAdminDashboardData = (mockMode) => {
  const api = useAxiosSecure();

  return useQuery({
    queryKey: ["adminDashboardSummary", mockMode],

    queryFn: async () => {
      // 1. Handle Mock Mode: Return MOCK data after a slight delay
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK;
      }

      // 2. Handle API Fetch
      const res = await api.get("/users/dashboard-summary");
      // Return the inner data object
      return res.data.data;
    },

    // Configuration
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minute
    refetchOnWindowFocus: true,

    // Initial data setup for seamless loading (especially useful for pre-rendered state)
    // Note: We are returning the *unprocessed* structure from queryFn
    initialData: mockMode ? MOCK : undefined,

    // Keep the query enabled (mockMode handling is inside queryFn)
    enabled: true,
  });
};

export default useAdminDashboardData;
