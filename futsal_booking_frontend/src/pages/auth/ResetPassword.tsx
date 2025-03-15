import CommonAuthLayout from "../../layout/CommonAuthLayout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema } from "../../schema/authSchema";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import useRedirectIfLoggedIn from "../../hooks/useRedirectIfLoggedIn";
import { useForgetPassword } from "../../services/mutations/authMutation";
import axios from "axios";

export default function ResetPassword() {
  useRedirectIfLoggedIn();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigate();
  const { isError, error, mutateAsync } = useForgetPassword();

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    setLoading(true);

    const data = await mutateAsync({
      email: values.email,
    });

    if (data.status === "success") {
      setLoading(false);
      setErrorMessage("");
      toast.success(data.message);
      localStorage.setItem("email", values.email);
      navigation("/auth/reset-password/verify");
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
    <CommonAuthLayout
      backLink="/auth"
      title="Reset Password"
      subTitle="Enter your email address to reset your password."
    >
      <div className="form">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-[24px] w-full"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[16px] font-[500]">
                    Email<span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-[12px] h-[48px] border py-[4px] px-[12px]"
                      placeholder="Enter your email here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-[12px] text-destructive -mt-[18px]"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
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
              send
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            </Button>
          </form>
        </Form>
      </div>
    </CommonAuthLayout>
  );
}
