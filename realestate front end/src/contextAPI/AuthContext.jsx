import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const url = import.meta.env.VITE_API;

  const login = async (payload) => {
    try {
      setLoading(true);
      const res = await axios.post(`${url}/auth/login`, payload, {
        withCredentials: true,
      });
      setUser(res.data.data.user);
      setToken(res.data.data.accessToken);
      setLoading(false);
      return res;
    } catch (error) {
      setLoading(false);
      return error;
    }
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
      setLoading(false);
    }
  };

  useEffect(() => {
    userStatus();
  }, []);

  const authInfo = {
    user: user,
    setUser,
    loading,
    setLoading,
    token,
    setToken,
    login,
    userStatus,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
