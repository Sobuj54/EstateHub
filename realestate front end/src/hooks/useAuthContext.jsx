import { AuthContext } from "contextAPI/AuthContext";
import { useContext } from "react";

const useAuthContext = () => {
  const authInfo = useContext(AuthContext);
  return authInfo;
};

export default useAuthContext;
