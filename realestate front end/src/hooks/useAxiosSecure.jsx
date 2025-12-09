import axios from "axios";
import useAuthContext from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { token, setToken, setUser, setLoading, logout } = useAuthContext();

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;

        if (err.response && err.response.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const res = await axiosSecure.get("/auth/refresh-token");

            setToken(res.data.data.accessToken);
            setUser(res.data.data.user);

            original.headers.Authorization = `Bearer ${res.data.data.accessToken}`;

            return axiosSecure(original);
          } catch (error) {
            await logout();
            navigate("/login");
            return Promise.reject(error);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [token, navigate, setToken, setUser, setLoading]);

  return axiosSecure;
};

export default useAxiosSecure;
