import { isPossiblePhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Invalid email address"),
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean().default(false).optional(),
});

export const SignUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Invalid email address"),
  phone: z
    .string()
    .min(1, { message: "Phone number is required" })
    .refine((phone) => isPossiblePhoneNumber(phone), {
      message: "Invalid phone number for the selected country",
    }),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirm Password is required!" }),
  role: z.enum(["USER", "OWNER"]).default("USER").optional(),
});

export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Invalid email address"),
});

export const OtpSchema = z.object({
  otp: z.string().min(5, {
    message: "Your one-time password must be 5 characters.",
  }),
});

export const NewPasswordSchema = z.object({
  new_password: z.string().min(1, { message: "Password is required!" }),
  confirm_password: z
    .string()
    .min(1, { message: "Confirm Password is required!" }),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Old Password is required!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .regex(/\d/, { message: "Password must contain at least one number!" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character!",
    }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirm Password is required!" }),
});
