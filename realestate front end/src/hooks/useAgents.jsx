import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useAgents = (pageNo, limit, query) => {
  const api = useAxiosSecure();

  return useQuery({
    queryKey: ["agents", { pageNo, limit, query }],
    queryFn: async () => {
      const res = await api.get("/users/agents/", {
        params: { pageNo, limit, query },
      });
      // Assuming the API returns data in the format { data: { data: { agents: [...], ... } } }
      return res.data.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export default useAgents;
