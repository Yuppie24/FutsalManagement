import Cookies from "js-cookie";
import { toast } from "sonner";
import { create } from "zustand";

// Define types for your Zustand store
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  setTokens: (accessToken: string, refreshToken: string, role: string) => void;
  logout: () => void;
}

// Create the Zustand store
const useAuthStore = create<AuthState>((set) => ({
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  role: Cookies.get("role") || null,

  // Method to set new tokens
  setTokens: (accessToken: string, refreshToken: string, role: string) => {
    Cookies.set("accessToken", accessToken, {
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("refreshToken", refreshToken, {
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("role", role, {
      secure: true,
      sameSite: "Strict",
    });

    set({ accessToken, refreshToken, role });
  },

  // Logout method to clear tokens
  logout: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");
    localStorage.clear();
    toast.success("You are logged out!");
    set({ accessToken: null, refreshToken: null, role: null });
  },
}));

export default useAuthStore;