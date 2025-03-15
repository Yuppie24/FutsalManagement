import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  changePassword,
  EmailVerifyOtp,
  handleBasicSignUp,
  handleForgetPassword,
  handleLogin,
  handleLogout,
  handleResendForgetPasswordOtp,
  handleSetNewPassword,
  resendTwoFaOtp,
  resetPasswordVerifyOtp,
} from "../api/auth";

export function useLoginUser() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return handleLogin({ email, password });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Something went wrong");
      }
    },
  });
}

export function useBasicSignUpUser() {
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      email,
      password,
      confirm_password,
      role
    }: {
      name: string;
      phone: string;
      email: string;
      password: string;
      confirm_password: string;
      role: string;
    }) => {
      return handleBasicSignUp({ name, phone, email, password, confirm_password, role });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Something went wrong");
      }
    },
  });
}

export function useVerifyEmailOTP() {
  return useMutation({
    mutationFn: async ({ OTP }: { OTP: string }) => {
      return EmailVerifyOtp({ otp: OTP });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Something went wrong");
      }
    },
  });
}

export function useResendEmailOTP() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return resendTwoFaOtp({ email });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Something went wrong");
      }
    },
  });
}

export function useResendResetOTP() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return resendTwoFaOtp({ email });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Something went wrong");
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
      confirmPassword,
    }: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      return changePassword({ oldPassword, newPassword, confirmPassword });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Internal server error! Something went wrong!"
        );
      }
    },
  });
}

export function logoutUser() {
  return useMutation({
    mutationFn: async () => handleLogout,
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Internal server error! Something went wrong!"
        );
      }
    },
  });
}

export function useForgetPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return handleForgetPassword({ email });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Internal server error! Something went wrong!"
        );
      }
    },
  });
}

export function useResetPasswordVerifyOtp() {
  return useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      return resetPasswordVerifyOtp({ otp });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Internal server error! Something went wrong!"
        );
      }
    },
  });
}

export function useResendForgetPasswordOtp() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return handleResendForgetPasswordOtp({ email });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Internal server error! Something went wrong!"
        );
      }
    },
  });
}

export function useSetNewPassword() {
  return useMutation({
    mutationFn: async ({
      new_password,
      confirm_password,
    }: {
      new_password: string;
      confirm_password: string;
    }) => {
      return handleSetNewPassword({ new_password, confirm_password });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Internal server error! Something went wrong!"
        );
      }
    },
  });
}
