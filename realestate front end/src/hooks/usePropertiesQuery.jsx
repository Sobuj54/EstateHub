import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const PROPERTIES_LIMIT = 10;
/**
 * Custom hook to fetch a specific page of properties.
 * @param {object} params - All filter parameters (query, location, minPrice, etc.)
 * @param {number} pageNo - The current page number to fetch
 */
export const usePropertiesQuery = (params, pageNo) => {
  const api = useAxiosSecure(); // Use your configured axios instance

  // The query key now includes the page number, forcing a refetch on page change
  const queryKey = ["properties", params, pageNo];

  const fetchProperties = async () => {
    // Construct query string from all parameters and pagination
    const searchParams = new URLSearchParams(params);
    searchParams.set("pageNo", pageNo.toString());
    searchParams.set("limit", PROPERTIES_LIMIT.toString());

    const response = await api.get(`/properties?${searchParams.toString()}`);

    // Server response structure: { data: { properties, currentPage, totalPage } }
    return response.data.data;
  };

  return useQuery({
    queryKey: queryKey,
    queryFn: fetchProperties,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
};
