import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Loader2, StarIcon } from "lucide-react";
import futsalCourtVer from "/futsalCourtVer.jpg";
import { Separator } from "../components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import { BookingSchema } from "../schema/bookingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput from "react-phone-number-input";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import eSewaLogo from "/eSewa_White.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useUserStore } from "../store/userStore";
import { toast } from "sonner";
import useRedirectIfLoggedIn from "../hooks/useRedirectIfLoggedIn";
import useProtectRoutes from "../hooks/useProtectRoutes";

const TOKEN = `Token ${Cookies.get("accessToken")}`;

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: string;
  userName: string;
  facility: number;
  created_at: string;
  image: string;
}

interface Facility {
  id: number;
  name: string;
  type: string;
  surface: string;
  size: string;
  capacity: number;
  status: string;
  address: string;
  thumbnail: string;
  images: { id: number; image: string; facility: number }[];
  reviews: Review[];
}

interface TimeSlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  price: string;
  discounted_price: string;
  status: string;
  field: number;
}
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const BookingPage = () => {
  useProtectRoutes()
  const { userData } = useUserStore();
  const form = useForm<z.infer<typeof BookingSchema>>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { facilityId, slotId } = useParams();
  const date = new URLSearchParams(window.location.search).get("date");
  const [facility, setFacility] = useState<Facility | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [startHour, startMinute] = slot?.start_time
    ? slot.start_time.split(":").map(Number)
    : [0, 0];
  const [endHour, endMinute] = slot?.end_time
    ? slot.end_time.split(":").map(Number)
    : [0, 0];
  const start = Date.UTC(1970, 0, 1, startHour, startMinute);
  const end = Date.UTC(1970, 0, 1, endHour, endMinute);
  const time = `${slot?.start_time?.slice(0, 5)} - ${slot?.end_time?.slice(0, 5)}`;
  const timeDiff = (end - start) / (1000 * 60 * 60);

  // Update form values when userData changes
  useEffect(() => {
    if (userData) {
      form.setValue("email", userData.email || "");
      form.setValue("phone", userData.phone || "");
    }
  }, [userData, form]);

  useEffect(() => {
    const fetchFacility = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/facilities/${facilityId}/`,
          {
            headers: {
              Authorization: TOKEN,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status === "success") {
          setFacility(response.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch facility details");
      }
    };

    const fetchSlot = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/time-slots/${slotId}/`,
          {
            headers: {
              Authorization: TOKEN,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status === "success") {
          setSlot(response.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch time slot details");
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
    fetchSlot();
  }, [facilityId, slotId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDate(date)

  const onSubmit = async (data: z.infer<typeof BookingSchema>) => {
    console.log(data);
    if (!termsAccepted) {
      setErrorMessage("You must accept the terms and conditions to proceed.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Create a booking
      const bookingData = {
        facility_id: facilityId,
        date: formattedDate,
        time: time,
        slot_id: slotId,
        email: data.email,
        phone: data.phone,
        price: slot?.discounted_price,
        payment_type: paymentType,
      };

      const bookingResponse = await axios.post(
        `${baseUrl}/bookings/`,
        bookingData,
        {
          headers: {
            Authorization: TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      if (bookingResponse.data.status !== "success") {
        throw new Error(bookingResponse.data.message || "Failed to create booking");
      }

      const bookingId = bookingResponse.data.data.id;

      // Step 2: Initiate payment
      const paymentResponse = await axios.post(
        `${baseUrl}/bookings/${bookingId}/initiate-payment/`,
        {},
        {
          headers: {
            Authorization: TOKEN,
          },
        }
      );

      if (paymentResponse.data.status !== "success") {
        throw new Error(paymentResponse.data.message || "Failed to initiate payment");
      }

      // Step 3: Redirect to eSewa payment gateway
      const formData = paymentResponse.data.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during booking.");
      toast.error(error.message || "An error occurred during booking.");
      setLoading(false);
    }
  };

  if (loading && !facility && !slot) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-[80%] mx-auto py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Side - Booking Summary */}
      <div>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

            {/* Football Field Image */}
            <div className="mb-4 relative">
              <img
                src={facility?.thumbnail ?? futsalCourtVer}
                alt="Football field"
                className="object-cover rounded-md"
              />
            </div>

            {/* Play Zone Info */}
            <div className="flex items-center mb-6">
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{facility?.name}</h3>
                  <div className="flex items-center ml-2">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs ml-1">
                      {facility?.reviews?.length
                        ? (
                            facility.reviews.reduce((acc, review) => acc + review.rating, 0) /
                            facility.reviews.length
                          ).toFixed(2)
                        : "4.91"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 !mt-0">{facility?.address}</p>
              </div>
            </div>

            {/* Slot Duration */}
            <div>
              <p className="text-sm font-medium text-gray-600">Slot Duration</p>
              <div className="flex justify-between items-center">
                <p className="font-medium !mt-0">{time}</p>
                <p className="font-medium !mt-0">{timeDiff} hour</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Slot Date & Time */}
            <div>
              <p className="text-sm font-medium text-gray-600">Slot Date & Time</p>
              <div className="flex justify-between items-center">
                <p className="font-medium !mt-0">{date}</p>
                <p className="font-medium !mt-0">{time}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-md font-medium mb-3">Payment Details</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Sub Total</span>
              <span className="font-medium">NRS {slot?.price}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium">
                NRS {parseFloat(slot?.price || "0") - parseFloat(slot?.discounted_price || "0")}
              </span>
            </div>
            <Separator className="mt-2 mb-4" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                NRS{" "}
                {paymentType === "full"
                  ? slot?.discounted_price
                  : (parseFloat(slot?.discounted_price || "0") * 0.25).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Payment Form */}
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-[24px]"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-[16px] font-[500]">
                          Phone Number
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl className="rounded-[12px] h-[48px] border pl-[12px] flex items-center focus-within:ring-1 focus-within:ring-primary">
                          <PhoneInput
                            international
                            placeholder="Enter phone number"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value || "");
                            }}
                            defaultCountry="NP"
                            className="bg-transparent border border-gray-300 rounded-[12px] h-[48px] px-[12px]"
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

                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div>
                        <h3 className="text-md font-medium mb-3">Select Payment Type</h3>
                        <RadioGroup
                          defaultValue="full"
                          className="space-y-4"
                          onValueChange={(value: "full" | "partial") => setPaymentType(value)}
                        >
                          <div className="flex items-start space-x-3 border p-3 rounded-md">
                            <RadioGroupItem value="full" id="full" className="mt-1" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <Label htmlFor="full" className="font-medium">
                                  Full Payment
                                </Label>
                                <span className="font-medium">NRS {slot?.discounted_price}</span>
                              </div>
                              <p className="text-sm text-gray-500 !mt-0">
                                You are paying the full amount for booking.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 border p-3 rounded-md">
                            <RadioGroupItem value="partial" id="partial" className="mt-1" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div className="flex-1">
                                  <Label htmlFor="partial" className="font-medium">
                                    Partial Payment
                                  </Label>
                                  <p className="text-sm text-gray-500 !mt-0">
                                    You can pay 25% of total amount for booking. Rest of the amount you have to pay before match start.
                                  </p>
                                </div>
                                <p className="font-medium !mt-0">
                                  NRS{" "}
                                  {slot?.discounted_price
                                    ? (parseFloat(slot.discounted_price) * 0.25).toFixed(2)
                                    : 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-start space-x-2 mb-6">
                    <Checkbox
                      id="terms"
                      className="mt-1"
                      checked={termsAccepted}
                      onCheckedChange={(checked: boolean) => setTermsAccepted(checked)}
                    />
                    <div>
                      <Label htmlFor="terms" className="text-sm">
                        I accept and agree
                        <a href="#" className="text-primary underline">
                          {" "}
                          terms conditions{" "}
                        </a>
                        and
                        <a href="#" className="text-primary underline">
                          {" "}
                          privacy policy{" "}
                        </a>
                        .
                      </Label>
                    </div>
                  </div>

                  <Button
                    disabled={loading || !termsAccepted}
                    type="submit"
                    className={cn(
                      "border-primary hover:bg-primary w-full text-lg font-medium",
                      {
                        "cursor-not-allowed": loading,
                      }
                    )}
                  >
                    Pay with <img src={eSewaLogo} alt="eSewa Logo" className="w-20" />
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;