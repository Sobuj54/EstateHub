import useAxiosSecure from "hooks/useAxiosSecure";
import { toast } from "react-toastify";

const logout = async (setLoading, setUser, setToken) => {
  const axiosSecure = useAxiosSecure();
  try {
    setLoading(true);
    await axiosSecure.post("/auth/logout");
    setUser(null);
    setToken(null);
    setLoading(false);
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
    setLoading(false);
    toast.error("Logout Failed.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }
};

export default logout;
