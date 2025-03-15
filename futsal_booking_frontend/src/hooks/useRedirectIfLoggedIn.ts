import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect } from "react";

function useRedirectIfLoggedIn(): void {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      if(role === 'OWNER'){
      navigate("/dashboard");
      }else{
        navigate("/");
      }
    }
  }, [accessToken, navigate]);
}

export default useRedirectIfLoggedIn;