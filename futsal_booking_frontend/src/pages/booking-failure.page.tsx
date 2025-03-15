import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, Download, XCircle } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { Separator } from "../components/ui/separator";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useUserStore } from "../store/userStore";
import { cn } from "../lib/utils";
import useProtectRoutes from "../hooks/useProtectRoutes";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface Slot {
  id: number;
  time: string;
  price: string;
  status: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  discounted_price?: string;
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
  thumbnail?: string;
  images: { id: number; image: string; facility: number }[];
}

interface Payment {
  id: number;
  amount: string;
  tax_amount: string;
  service_charge: string;
  delivery_charge: string;
  total_amount: string;
  transaction_uuid: string;
  payment_status: string;
  transaction_code?: string;
  ref_id?: string;
  payment_type: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  role: string;
  is_active: boolean;
  is_staff: boolean;
}

interface BookingInfo {
  id: number;
  email: string;
  phone: string;
  slot: Slot;
  facility: Facility;
  customer: Customer;
  date: string;
  time: string;
  price: string;
  status: string;
  payment: Payment;
  created_at: string;
  updated_at: string;
}

const BookingFailure = () => {
  useProtectRoutes();
  const { bookingId } = useParams(); // Get booking ID from URL
  const navigate = useNavigate();
  const { userData } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const TOKEN = `Token ${Cookies.get("accessToken")}`; // Adjust token retrieval as per your app

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/bookings/${bookingId}/`, {
          headers: {
            Authorization: TOKEN,
          },
        });

        if (response.data.status === "success") {
          const data = response.data.data;
          setBookingInfo(data);

          // Validate customer ID and payment status
          if (
            data.customer.id !== userData.id ||
            !["Fully Paid", "Partially Paid"].includes(
              data.payment.payment_status
            )
          ) {
            toast.error("Unauthorized access or payment not confirmed");
            navigate("/"); // Redirect to error page
            return;
          }
        } else {
          throw new Error(
            response.data.message || "Failed to fetch booking data"
          );
        }
      } catch (err: any) {
        console.error("Error fetching booking data:", err);
        setError(
          err.message || "An error occurred while fetching booking data"
        );
        toast.error(
          err.message || "An error occurred while fetching booking data"
        );
        if (err.response?.status === 404) {
          navigate("/error"); // Redirect to error page for 404
        }
      } finally {
        setLoading(false);
        toast.dismiss();
      }
    };

    fetchData();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className="text-center p-6 w-full">
        Loading booking confirmation...
      </div>
    );
  }

  if (error || !bookingInfo) {
    return (
      <div className="text-center p-6 text-red-500 w-full">
        {error || "Booking data not found"}
      </div>
    );
  }

  return (
    <div className="max-w-[80%] mx-auto p-4">
      <Card className="rounded-lg shadow-md">
        <CardContent className="p-6">
          {/* Header with Logo */}
          {/* Header with Logo */}
          <div className="text-center mb-4 w-full">
            <div>
              <i className="flex items-center justify-center text-3xl font-bold text-primary">
                Futsal{" "}
                <span>
                  <GiSoccerBall />
                </span>
                Booking
              </i>
            </div>
          </div>

          {/* Failure Icon */}
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>

          {/* Failure Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold mb-1">Payment Failed</h2>
            <p className="text-sm text-gray-700 !mt-0">
              Your booking at {bookingInfo.facility.name} could not be completed
              due to a payment failure.
            </p>
          </div>

          {/* Booking Details Section */}
          <div className="mb-6">
            {/* Details Grid */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Slot Duration</span>
                <span className="font-medium">
                  {bookingInfo.slot.start_time} - {bookingInfo.slot.end_time}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{bookingInfo.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{bookingInfo.time}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">
                  NRS {bookingInfo.slot.price}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium">NRS 0.00</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">
                  NRS{" "}
                  {(
                    parseFloat(bookingInfo.slot.price) -
                    parseFloat(bookingInfo.slot.discounted_price ?? "0")
                  ).toFixed(2)}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold">
                <span>Net Payable</span>
                <span>NRS {bookingInfo.slot.price}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="font-medium">
                  NRS{" "}
                  {bookingInfo.payment.payment_status === "Fully Paid"
                    ? bookingInfo.payment.total_amount
                    : "0.00"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Due</span>
                <span className="font-medium">
                  NRS{" "}
                  {bookingInfo.payment.payment_status === "Fully Paid" &&
                  bookingInfo.payment.payment_type === "full"
                    ? "0.00"
                    : (
                        parseFloat(bookingInfo.slot.price) -
                        parseFloat(bookingInfo.payment.total_amount)
                      ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Link to="/">
            <Button variant="outline" className="w-full">
              Go to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingFailure;
