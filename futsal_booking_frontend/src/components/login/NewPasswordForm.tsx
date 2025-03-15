import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NewPasswordSchema } from "../../schema/authSchema";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useSetNewPassword } from "../../services/mutations/authMutation";
import axios from "axios";

interface IProps {
  setVerified: (value: boolean) => void;
}

function NewPasswordForm({ setVerified }: IProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [_, setDoPasswordsMatch] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const { isError, error, mutateAsync } = useSetNewPassword();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    const password = form.watch("new_password");
    const confirmPassword = form.watch("confirm_password");

    setIsLengthValid(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setDoPasswordsMatch(password === confirmPassword);
  }, [form.watch("new_password"), form.watch("confirm_password")]);

  async function onsubmit(values: z.infer<typeof NewPasswordSchema>) {
    setLoading(true);
    const data = await mutateAsync({
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    });

    if (data.status === "success") {
      setLoading(false);
      setVerified(true);
      setErrorMessage("");
      toast.success(data.message);
    } else {
      toast.error(data.message);
      setLoading(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isError) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.message);
      }
    }
  }, [isError, error]);

  return (
    <div className="form">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onsubmit)}
          className="flex flex-col gap-[24px]"
        >
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="text-[16px] font-[500]">
                  Password<span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="rounded-[12px] h-[48px] border border-primary py-[4px] px-[12px]"
                    placeholder="Enter your password here"
                    {...field}
                  />
                </FormControl>

                {showPassword === false ? (
                  <EyeOff
                    onClick={togglePasswordVisibility}
                    className=" absolute top-9 right-4 cursor-pointer"
                  />
                ) : (
                  <Eye
                    onClick={togglePasswordVisibility}
                    className=" absolute top-9 right-4 cursor-pointer"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="text-[16px] font-[500]">
                  Confirm Password<span className="text-desctructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    className="rounded-[12px] h-[48px] border border-primary py-[4px] px-[12px]"
                    placeholder="Enter your confirm password here"
                    {...field}
                  />
                </FormControl>

                {showConfirmPassword === false ? (
                  <EyeOff
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute top-9 right-4 cursor-pointer"
                  />
                ) : (
                  <Eye
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute top-9 right-4 text-[#6F7C8E] cursor-pointer"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 100 }}
                transition={{
                  duration: 0.5,
                }}
                className="text-[12px] text-destructive -mt-[18px]"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="condition">
            <div className="flex flex-col gap-1">
              <div className="flex justify-start items-center gap-2">
                <div
                  className={`${
                    isLengthValid ? "bg-accentGreen" : "bg-destructive"
                  } rounded-full h-[16px] w-[16px] flex justify-center items-center`}
                >
                  {isLengthValid ? (
                    <Check className="h-[10px] w-[10px] text-white" />
                  ) : (
                    <X className="h-[10px] w-[10px] text-white" />
                  )}
                </div>
                Contains at least 8 characters
              </div>
              <div className="flex justify-start items-center gap-2">
                <div
                  className={`${
                    hasUpperCase ? "bg-accentGreen" : "bg-destructive"
                  } rounded-full h-[16px] w-[16px] flex justify-center items-center`}
                >
                  {hasUpperCase ? (
                    <Check className="h-[10px] w-[10px] text-white" />
                  ) : (
                    <X className="h-[10px] w-[10px] text-white" />
                  )}
                </div>
                Contains at least 1 uppercase letter
              </div>
              <div className="flex justify-start items-center gap-2">
                <div
                  className={`${
                    hasNumber ? "bg-accentGreen" : "bg-destructive"
                  } rounded-full h-[16px] w-[16px] flex justify-center items-center`}
                >
                  {hasNumber ? (
                    <Check className="h-[10px] w-[10px] text-white" />
                  ) : (
                    <X className="h-[10px] w-[10px] text-white" />
                  )}
                </div>
                Contains at least 1 number
              </div>
              <div className="flex justify-start items-center gap-2">
                <div
                  className={`${
                    hasSpecialChar ? "bg-accentGreen" : "bg-destructive"
                  } rounded-full h-[16px] w-[16px] flex justify-center items-center`}
                >
                  {hasSpecialChar ? (
                    <Check className="h-[10px] w-[10px] text-white" />
                  ) : (
                    <X className="h-[10px] w-[10px] text-white" />
                  )}
                </div>
                Contains at least 1 special character
              </div>
            </div>
          </div>
          <Button
            disabled={loading}
            type="submit"
            size={"login"}
            variant={"login"}
            className={cn(
              "flex justify-center items-center gap-4 cursor-pointer",
              {
                "cursor-not-allowed": loading,
              }
            )}
          >
            Update Password
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default NewPasswordForm;
