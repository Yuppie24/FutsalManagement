import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ILoggedInUserData, ILoggedInUserDataState } from "../types/authTypes";

export const useUserStore = create<ILoggedInUserDataState>()(
  devtools(
    persist(
      (set) => ({
        userData: {
          id: "",
          name: "",
          email: "",
          phone: "",
          avatar: "",
          is_email_verified: true,
          is_phone_verified: false,
          role: "",
          is_active: true,
          is_staff: false,
          created_at: "",
          updated_at: "",
        },
        setLoggedInUserData: (userData: ILoggedInUserData) => set({ userData }),
        clearLoggedInUserData: () =>
          set({
            userData: {
              id: "",
              name: "",
              email: "",
              phone: "",
              avatar: "",
              is_email_verified: true,
              is_phone_verified: false,
              role: "",
              is_active: true,
              is_staff: false,
              created_at: "",
              updated_at: "",
            },
          }),
      }),
      {
        name: "user-storage",
      }
    )
  )
);
