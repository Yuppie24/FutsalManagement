import axios, { AxiosResponse } from "axios";
import axiosInstance from "./axiosInstance";
import Cookies from "js-cookie";
import { useUserStore } from "../../store/userStore";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export interface ISignUpResponse {
  status: string;
  message: string;
  data: {};
}

export interface ILoginResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    role: string;
  };
}

export interface ILoggedInUserResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      avatar: string;
      is_email_verified: boolean;
      is_phone_verified: boolean;
      role: string;
      is_active: boolean;
      is_staff: boolean;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface IVerifyTwoFaOtpResponse {
  status: string;
  message: string;
  data: {};
}

export interface IResendVerifyTwoFaOtpResponse {
  status: string;
  message: string;
  data: {};
}

export interface IChangePasswordResponse {
  status: string;
  message: string;
  data: {};
}

export interface IHandleForgetPasswordResponse
  extends IChangePasswordResponse {}

export interface IVerifyForgetPasswordOtpResponse
  extends IChangePasswordResponse {}

export interface ILogoutResponse {
  status: string;
  message: string;
}

export const handleLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response: AxiosResponse<ILoginResponse> =
      await axiosInstance.post<ILoginResponse>("/auth/login/", {
        email,
        password,
      });
    return response.data;
  } catch (error) {
    console.error("Error in handle login function", error);
    throw error;
  }
};

export const handleBasicSignUp = async ({
  name,
  phone,
  email,
  password,
  confirm_password,
  role,
}: {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
}) => {
  try {
    const response: AxiosResponse<ISignUpResponse> =
      await axiosInstance.post<ISignUpResponse>("/auth/signup/", {
        name,
        phone,
        email,
        password,
        confirm_password,
        role,
      });
    return response.data;
  } catch (error) {
    console.error("Error in handle login function", error);
    throw error;
  }
};

export const verifyTwoFaOtp = async ({
  otp,
}: {
  otp: string;
}): Promise<IVerifyTwoFaOtpResponse> => {
  try {
    const response: AxiosResponse<IVerifyTwoFaOtpResponse> =
      await axios.post<IVerifyTwoFaOtpResponse>(
        `${baseUrl}/auth//verify-email/`,
        {
          otp: otp,
          email: localStorage.getItem("email"),
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in verify otp function:", error);
    throw error;
  }
};

export const resendTwoFaOtp = async ({
  email,
}: {
  email: string;
}): Promise<IResendVerifyTwoFaOtpResponse> => {
  try {
    const response: AxiosResponse<IResendVerifyTwoFaOtpResponse> =
      await axios.post<IResendVerifyTwoFaOtpResponse>(
        `${baseUrl}/auth/resend-otp/`,
        {
          email,
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in verifyotp function:", error);
    throw error;
  }
};

export const changePassword = async ({
  oldPassword,
  newPassword,
  confirmPassword,
}: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<IChangePasswordResponse> => {
  try {
    const response: AxiosResponse<IChangePasswordResponse> =
      await axiosInstance.patch<IChangePasswordResponse>(
        `auth/update-password`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        }
      );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLoggedInUser = async (): Promise<ILoggedInUserResponse> => {
  try {
    const response: AxiosResponse<ILoggedInUserResponse> =
      await axiosInstance.get<ILoggedInUserResponse>(`auth/me/`, {
        headers: {
          Authorization: `Token ${Cookies.get("accessToken")}`,
        },
      });
    useUserStore.getState().setLoggedInUserData(response.data.data.user);
    return response.data;
  } catch (error) {
    console.error("Error in getLoggedInUser function:", error);
    throw error;
  }
};

export const handleLogout = async () => {
  try {
    const response: AxiosResponse<ILogoutResponse> =
      await axiosInstance.post<ILogoutResponse>(
        "auth/logout/",
        {},
        {
          headers: {
            Authorization: `Token ${Cookies.get("accessToken")}`,
          },
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in handleLogout function:", error);
    throw error;
  }
};

export const handleForgetPassword = async ({
  email,
}: {
  email: string;
}): Promise<IHandleForgetPasswordResponse> => {
  try {
    const response: AxiosResponse<IHandleForgetPasswordResponse> =
      await axiosInstance.post<IHandleForgetPasswordResponse>(
        `auth/forgot-password/`,
        {
          email,
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in handleForgetPassword function:", error);
    throw error;
  }
};

export const EmailVerifyOtp = async ({
  otp,
}: {
  otp: string;
}): Promise<IVerifyForgetPasswordOtpResponse> => {
  try {
    const response: AxiosResponse<IVerifyForgetPasswordOtpResponse> =
      await axiosInstance.post<IVerifyForgetPasswordOtpResponse>(
        `auth/verify-email/`,
        {
          otp,
          email: localStorage.getItem("email"),
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in resetPasswordVerifyOtp function:", error);
    throw error;
  }
};

export const resetPasswordVerifyOtp = async ({
  otp,
}: {
  otp: string;
}): Promise<IVerifyForgetPasswordOtpResponse> => {
  try {
    const response: AxiosResponse<IVerifyForgetPasswordOtpResponse> =
      await axiosInstance.post<IVerifyForgetPasswordOtpResponse>(
        `auth/verify-password-reset/`,
        {
          otp,
          email: localStorage.getItem("email"),
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in resetPasswordVerifyOtp function:", error);
    throw error;
  }
};

export const handleResendForgetPasswordOtp = async ({
  email,
}: {
  email: string;
}): Promise<IResendVerifyTwoFaOtpResponse> => {
  // using this as a type as they both are same...
  try {
    const response: AxiosResponse<IResendVerifyTwoFaOtpResponse> =
      await axiosInstance.post<IResendVerifyTwoFaOtpResponse>(
        `auth/resend-reset-otp`,
        {
          email,
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in handleResendForgetPasswordOtp function:", error);
    throw error;
  }
};

export const handleSetNewPassword = async ({
  new_password,
  confirm_password,
}: {
  new_password: string;
  confirm_password: string;
}): Promise<IChangePasswordResponse> => {
  try {
    const response: AxiosResponse<IChangePasswordResponse> =
      await axiosInstance.post<IChangePasswordResponse>(
        `auth/reset-password/`,
        {
          new_password,
          confirm_password,
          email: localStorage.getItem("email"),
          otp: localStorage.getItem("otp"),
        }
      );
    return response.data;
  } catch (error) {
    console.error("Error in handleSetNewPassword function:", error);
    throw error;
  }
};
