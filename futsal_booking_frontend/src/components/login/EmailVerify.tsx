import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useResendEmailOTP,
  useVerifyEmailOTP,
  useResendResetOTP,
  useResetPasswordVerifyOtp,
} from "../../services/mutations/authMutation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpSchema } from "../../schema/authSchema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import CountdownTimer from "../custom-ui/PasswordVerifyTimer";

interface IProps {
  redirectLink?: string;
  type: "EmailVerify" | "ResetPassword";
}

function EmailVerify({ redirectLink, type }: IProps) {
  const [reset, setReset] = useState(false);
  const [time, setTime] = useState({
    minutes: 15,
    seconds: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigate();
  const [loading, setLoading] = useState(false);
  const verifyEmailOTP = useVerifyEmailOTP();
  const resendResetOTP = useResendResetOTP();
  const verifyResetOTP = useResetPasswordVerifyOtp();
  const resendEmailOTP = useResendEmailOTP();

  const form = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (reset === true) {
      setTime({
        minutes: 15,
        seconds: 0,
      });
    }
  }, [reset]);

  const handleResendOTP = async () => {
    setReset(true);
    try {
      if (type === "ResetPassword") {
        const response = await resendResetOTP.mutateAsync({
          email: (localStorage.getItem("email") as string) || "",
        });
        toast.success(response.message);
      } else {
        const response = await resendEmailOTP.mutateAsync({
          email: (localStorage.getItem("email") as string) || "",
        });
        toast.success(response.message);
      }
      setErrorMessage("");
      setReset(false);
    } catch (error) {
      setReset(false);
    }
  };

  async function onSubmit(values: z.infer<typeof OtpSchema>) {
    setLoading(true);
   if (type === "ResetPassword") {
      const data = await verifyResetOTP.mutateAsync({
        otp: values.otp,
      });
      if (data.status === "success") {
        setLoading(false);
        setErrorMessage("");
        toast.success(data.message);
        localStorage.setItem("otp", values.otp);
        navigation(
          `${redirectLink}` || "/auth/reset-password/set-new-password"
        );
      } else {
        toast.error(data.message);
        setLoading(false);
      }
      setLoading(false);
    }else{
      const data = await verifyEmailOTP.mutateAsync({
        OTP: values.otp,
      });
      if (data.status === "success") {
        setLoading(false);
        setErrorMessage("");
        toast.success(data.message);
        navigation("/auth");
      } else {
        toast.error(data.message);
        setLoading(false);
      }
      setLoading(false);
    }
    setLoading(false);
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-[24px]">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="mb-[24px]">
                <FormLabel className="text-[16px]">OTP</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </FormItem>
            )}
          />
          {errorMessage && (
            <div className="text-[14px] font-[500] text-center mb-[24px] bg-primary p-[8px] rounded-[8px] flex justify-center items-center gap-2">
              <TriangleAlert />
              {errorMessage}
            </div>
          )}
          <div className="text-primary text=[14px] font-normal text-center">
            Time Remaining: <CountdownTimer time={time} setTime={setTime} /> sec
          </div>
          <div className="button my-[32px]">
            <Button
              disabled={loading}
              size={"login"}
              variant={"login"}
              type="submit"
              className={cn(
                "flex justify-center items-center gap-4 cursor-pointer w-full",
                {
                  "cursor-not-allowed": loading,
                }
              )}
            >
              Verify Email
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            </Button>
          </div>
          <div className="text-center text-[14px] font-[400] flex gap-1 w-full justify-center items-center">
            If you didn’t receive a code!{" "}
            <span
              className="text-primary cursor-pointer font-[400] underline"
              onClick={handleResendOTP}
            >
              Resend
            </span>
            <div>
              {reset && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EmailVerify;
