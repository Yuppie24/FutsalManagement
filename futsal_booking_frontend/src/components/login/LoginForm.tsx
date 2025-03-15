import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { LoginSchema } from "../../schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import axios from "axios";
import { useLoginUser } from "../../services/mutations/authMutation";
import { useGoogleLogin } from "@react-oauth/google";
import { baseUrl } from "../../services/api/axiosInstance";
import { GoogleIcon } from "../../assets/socialButtons/GoogleIcon";
import { GiSoccerBall } from "react-icons/gi";
import useAuthStore from "../../store/authStore";
import { getLoggedInUser } from "../../services/api/auth";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const setTokens = useAuthStore((state) => state.setTokens);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const { isError, error, mutateAsync } = useLoginUser();

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setLoading(true);

    const data = await mutateAsync({
      email: values.email,
      password: values.password,
    });

    if (data.status === "success") {
      setLoading(false);
      setErrorMessage("");
      setTokens(data.data.access_token, data.data.refresh_token, data.data.role);
      toast.success(data.message);
      getLoggedInUser();

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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const googleAccessToken = tokenResponse.access_token;
      handleOAuthLogin("google", googleAccessToken); // send the token to the server
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  // Function to send OAuth token to the server
  const handleOAuthLogin = async (provider: string, accessToken: any) => {
    try {
      setLoading(true);

      // Get the user info from Google API using the access token
      const googleUserInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { name, email } = googleUserInfo.data;

      const response = await axios.post(`${baseUrl}/auth/register`, {
        name,
        email,
        provider,
        accessToken,
      });

      if (response.data.status === "success") {
        localStorage.setItem(
          "temporary_token",
          response.data.token.accessToken
        );
        localStorage.setItem("email", response.data.data.email);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="mx-auto md:w-[480px] h-auto">
        <div className="flex flex-col gap-[24px] w-full">
          <div className="heading mx-auto flex flex-col gap-[12px] md:w-[400px]">
            <div className="md:text-[30px] gap-2 w-full mx-auto md:leading-[33.6px] text-center font-semibold m-0 p-0 flex max-md:w-auto">
              Welcome to{" "}
              <span className="text-primary flex items-center">
                Futsal{" "}
                <span>
                  <GiSoccerBall />
                </span>
                Booking
              </span>
            </div>
            <div className="text-center md:text-[16px] w-full font-normal m-0 p-0">
              Simplifying your futsal booking experience
            </div>
          </div>
          <div className="form">
            <Form {...form}>
              <form
                className="flex flex-col gap-[24px]"
                onSubmit={form.handleSubmit(onSubmit)}
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[16px] font-[500]">
                        Password<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="rounded-[12px] h-[48px] border py-[4px] px-[12px]"
                          placeholder="Enter your password here"
                          {...field}
                        />
                      </FormControl>

                      {showPassword === false ? (
                        <EyeOff
                          onClick={togglePasswordVisibility}
                          className="absolute top-9 right-4 cursor-pointer"
                        />
                      ) : (
                        <Eye
                          onClick={togglePasswordVisibility}
                          className="absolute top-9 right-4 cursor-pointer"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between space-x-2 -mt-3">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Checkbox
                            name="remember"
                            value={field.value?.toString()}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            className="  data-[state=checked]:bg-primary border border-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-[14px] font-[400] ml-3 muted">
                          Remember me
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Link
                    to="/auth/reset-password"
                    className="text-[14px] underline font-[400] cursor-pointer text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="text-[12px] text-destructive"
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
                  Sign in
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex flex-col items-center text-center">
            <div>
              By signing in you accept the{" "}
              <Link to="/terms-and-conditions" className="text-primary underline">
                Terms and Conditions
              </Link>
            </div>
            <div>
              Don't have an account yet?{" "}
              <Link to="/auth/sign-up" className="text-primary underline">
                Sign up
              </Link>
            </div>
            <div>or sign in with</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              disabled={loading}
              onClick={() => loginWithGoogle()}
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
              <GoogleIcon />
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
