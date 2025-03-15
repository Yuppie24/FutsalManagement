import { isPossiblePhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const BookingSchema = z.object({
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
});
