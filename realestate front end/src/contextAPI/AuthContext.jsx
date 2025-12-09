import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const url = import.meta.env.VITE_API;

  const login = async (payload) => {
    setLoading(true);
    const res = await axios.post(`${url}/auth/login`, payload, {
      withCredentials: true,
    });
    setUser(res.data.data.user);
    setToken(res.data.data.accessToken);
    setLoading(false);
    return res;
  };

  const userStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/users/status`, {
        withCredentials: true,
      });
      setUser(res.data.data.user);
      setToken(res.data.data.accessToken);
      setLoading(false);
    } catch (error) {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    userStatus();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(`${url}/auth/logout`, {}, { withCredentials: true });
      toast.success("Logout Successful!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    setUser,
    loading,
    setLoading,
    token,
    setToken,
    login,
    userStatus,
    logout,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
