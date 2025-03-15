import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect } from "react";

function useProtectRoutes(): void {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/auth");
    }
  }, [accessToken, navigate]);
}

export default useProtectRoutes;
