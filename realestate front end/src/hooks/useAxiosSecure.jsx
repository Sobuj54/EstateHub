import axios from "axios";
import useAuthContext from "./useAuthContext";
import { useNavigate } from "react-router-dom";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { token, setToken, setUser, logut } = useAuthContext();

  axiosSecure.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosSecure.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config;

      if (err.response.status === 401 && !!original._retry) {
        original._retry = true;

        try {
          const res = await axiosSecure.get("/auth/refresh-token");
          setToken(res.data.accessToken);
          setUser(res.data.user);
          original.headers.Authorization = `Bearer ${res.data.accessToken}`;

          return axiosSecure(original);
        } catch (error) {
          await logut();
          navigate("/login");
        }
      }
      return Promise.reject(err);
    }
  );

  return axiosSecure;
};

export default useAxiosSecure;
