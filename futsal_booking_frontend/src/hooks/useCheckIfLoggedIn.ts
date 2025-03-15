import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";

function useCheckIfLoggedIn(): boolean {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (accessToken) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [accessToken]);

  return isLoggedIn;
}

export default useCheckIfLoggedIn;
