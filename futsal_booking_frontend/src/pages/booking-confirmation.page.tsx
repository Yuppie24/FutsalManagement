import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, Download } from "lucide-react";
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

const BookingConfirmation = () => {
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

  const generatePdfInvoice = async () => {
    if (!bookingInfo) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw invoice heading
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Futsal Booking", canvas.width / 2, 50);

      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      ctx.fillText("INVOICE", canvas.width / 2, 80);

      // Add invoice details
      ctx.textAlign = "left";
      ctx.font = "bold 14px Arial";
      ctx.fillText(`Invoice #: ${bookingInfo.id}`, 60, 120);
      ctx.fillText(`Date: ${bookingInfo.date}`, 60, 140);
      ctx.fillText(`Venue: ${bookingInfo.facility.name}`, 60, 160);

      // Add confirmation message
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Booking Confirmed", canvas.width / 2, 200);

      // Draw booking details section
      ctx.fillStyle = "#000000";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "left";
      ctx.fillText("Booking Details", 60, 240);

      ctx.beginPath();
      ctx.moveTo(60, 245);
      ctx.lineTo(740, 245);
      ctx.strokeStyle = "#dddddd";
      ctx.stroke();

      // Booking details table
      ctx.font = "14px Arial";
      ctx.fillText("Slot Duration:", 60, 280);
      ctx.fillText(
        `${bookingInfo.slot.start_time} - ${bookingInfo.slot.end_time}`,
        300,
        280
      );

      ctx.fillText("Date:", 60, 310);
      ctx.fillText(bookingInfo.date, 300, 310);

      ctx.fillText("Time:", 60, 340);
      ctx.fillText(bookingInfo.time, 300, 340);

      // Payment section
      ctx.font = "bold 16px Arial";
      ctx.fillText("Payment Summary", 60, 390);

      ctx.beginPath();
      ctx.moveTo(60, 395);
      ctx.lineTo(740, 395);
      ctx.stroke();

      // Payment table
      ctx.font = "14px Arial";
      const paymentItems = [
        { label: "Total", value: `NRS ${bookingInfo.slot.price}` },
        { label: "Processing Fee", value: `NRS 0.00` }, // Adjust based on your data
        {
          label: "Discount",
          value: `NRS ${(
            parseFloat(bookingInfo?.slot?.price) -
            parseFloat(bookingInfo.slot.discounted_price || "0")
          ).toFixed(2)}`,
        },
      ];

      let yPos = 430;
      paymentItems.forEach((item) => {
        ctx.fillText(item.label, 60, yPos);
        ctx.fillText(item.value, 300, yPos);
        yPos += 30;
      });

      ctx.beginPath();
      ctx.moveTo(60, yPos - 15);
      ctx.lineTo(740, yPos - 15);
      ctx.stroke();

      // Net payable
      ctx.font = "bold 14px Arial";
      ctx.fillText("Net Payable", 60, yPos);
      ctx.fillText(`NRS ${bookingInfo.slot.price}`, 300, yPos);
      yPos += 30;

      // Paid and Due
      ctx.font = "14px Arial";
      ctx.fillText("Paid", 60, yPos);
      ctx.fillText(
        `NRS ${
          bookingInfo.payment.payment_status === "Fully Paid"
            ? bookingInfo.payment.total_amount
            : "0.00"
        }`,
        300,
        yPos
      );
      yPos += 30;

      ctx.fillText("Due", 60, yPos);
      ctx.fillText(
        `NRS ${
          bookingInfo.payment.payment_status === "Fully Paid" &&
          bookingInfo.payment.payment_type === "full"
            ? "0.00"
            : (
                parseFloat(bookingInfo.slot.price) -
                parseFloat(bookingInfo.payment.total_amount)
              ).toFixed(2)
        }`,
        300,
        yPos
      );
      yPos += 30;

      // Footer
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Thank you for your booking!", canvas.width / 2, yPos + 40);
      ctx.fillText(
        "If you have any questions, please contact our support team.",
        canvas.width / 2,
        yPos + 60
      );
      ctx.fillStyle = "#ff0000";
      if (bookingInfo.payment.payment_type !== "full") {
        ctx.fillText(
          "*Due amount must be paid before you start playing",
          canvas.width / 2,
          yPos + 80
        );
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Booking_Invoice_${bookingInfo.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

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

          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>

          {/* Confirmation Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold mb-1">Booking Confirmed</h2>
            <p className="text-sm text-gray-700 !mt-0">
              Your booking at {bookingInfo.facility.name} has been successful.
            </p>
          </div>

          {/* Booking Details Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Booking details</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-green-500 flex items-center gap-1"
                onClick={generatePdfInvoice}
              >
                <Download className="h-4 w-4" />
                <span className="text-xs">Invoice</span>
              </Button>
            </div>

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

            {/* Due payment note */}
            <p
              className={cn(
                `text-xs text-red-500 mt-2`,
                bookingInfo.payment.payment_type === "full" ? "hidden" : ""
              )}
            >
              *Due amount must be paid before you start playing
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Go to Home
              </Button>
            </Link>
            <Link to="/my-bookings">
              <Button className="w-full">My Bookings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
