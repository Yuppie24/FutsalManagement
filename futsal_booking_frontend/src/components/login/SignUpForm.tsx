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
import { SignUpSchema } from "../../schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import axios from "axios";
import { useBasicSignUpUser } from "../../services/mutations/authMutation";
import { GoogleIcon } from "../../assets/socialButtons/GoogleIcon";
import { useGoogleLogin } from "@react-oauth/google";
import { baseUrl } from "../../services/api/axiosInstance";
import PhoneInput from "react-phone-number-input";
import { GiSoccerBall } from "react-icons/gi";

function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "USER",
    },
  });

  useEffect(() => {
    const password = form.watch("password");
    const confirmPassword = form.watch("confirmPassword");

    setIsLengthValid(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setDoPasswordsMatch(password === confirmPassword);
  }, [form.watch("password"), form.watch("confirmPassword")]);

  const { isError, error, mutateAsync } = useBasicSignUpUser();
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    setLoading(true);
    if (!doPasswordsMatch) {
      setLoading(false);
      setErrorMessage("Password and Confirm Password do not match.");
      toast.error("Password and Confirm Password do not match.");
      return;
    }

    const data = await mutateAsync({
      name: values.name,
      phone: values.phone,
      email: values.email,
      password: values.password,
      confirm_password: values.confirmPassword,
      role: values?.role || "USER",
    });

    if (data.status === "success") {
      setLoading(false);
      setErrorMessage("");
      localStorage.setItem("email", values.email);
      toast.success(data.message);
      navigate("/auth/email-verify")
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[16px] font-[500]">
                        Name<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-[12px] h-[48px] border py-[4px] px-[12px]"
                          placeholder="Enter your name here"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[16px] font-[500]">
                        Phone Number<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl className="rounded-[12px] h-[48px] border pl-[12px] flex items-center focus-within:ring-1 focus-within:ring-primary">
                        <PhoneInput
                          international
                          placeholder="Enter phone number"
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="US"
                          inputClassName="bg-transparent text-white border-none outline-none"
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="text-[16px] font-[500]">
                        Confirm Password
                        <span className="text-desctructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="rounded-[12px] h-[48px] border  py-[4px] px-[12px]"
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
                          className="absolute top-9 right-4 cursor-pointer"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[16px] font-[500]">
                        Role<span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <select
                            className="flex w-full border-input text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-sm:text-sm rounded-[12px] h-[48px] border py-[4px] px-[12px] bg-background appearance-none"
                            {...field}
                          >
                            <option value="USER">Futsal user</option>
                            <option value="OWNER">Futsal owner</option>
                          </select>
                        </FormControl>
                        <ChevronDown className="absolute top-[25%] right-[3%]" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
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
                  Sign up
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex flex-col items-center">
            <div>
              By signing up you accept the{" "}
              <Link
                to="/terms-and-conditions"
                className="text-primary underline"
              >
                Terms and Conditions
              </Link>
            </div>
            <div>
              Already have an account?{" "}
              <Link to="/auth" className="text-primary underline">
                Sign in
              </Link>
            </div>
            <div>or sign up with</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              disabled={loading}
              onClick={() => loginWithGoogle()}
              type="button"
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

export default SignUpForm;