import { GoogleOAuthProvider } from "@react-oauth/google";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex flex-col p-4">
        <Outlet />
      </div>
    </GoogleOAuthProvider>
  );
}
