// src/components/MyBooking.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Edit } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import Modal from "react-modal";

// Set the app element for accessibility (required by react-modal)
Modal.setAppElement("#root");

// Interface for the raw API response
interface APISlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  price: string;
  discounted_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  field: number;
  created_by: number;
}

interface APIFacility {
  id: number;
  images: { id: number; image: string; facility: number }[];
  name: string;
  type: string;
  surface: string;
  size: string;
  capacity: number;
  status: string;
  features: string[];
  thumbnail: string | null;
  address: string;
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface APIPayment {
  id: number;
  amount: string;
  tax_amount: string;
  service_charge: string;
  delivery_charge: string;
  total_amount: string;
  transaction_uuid: string;
  payment_status: string;
  transaction_code: string | null;
  ref_id: string | null;
  payment_type: string;
  created_at: string;
  updated_at: string;
}

interface APIBooking {
  id: number;
  email: string;
  phone: string;
  slot: APISlot;
  facility: APIFacility;
  date: string;
  time: string;
  price: string;
  status: string;
  payment: APIPayment;
  created_at: string;
  updated_at: string;
}

// Interface expected by the component
interface Booking {
  id: string;
  venue: string;
  location: string;
  status: string; // Will be "upcoming", "past", "canceled", "missed", or "all"
  paymentStatus: string;
  price: number;
  date: string;
  time: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const getStatusBgColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-[#22c55e]";
    case "past":
      return "bg-[#F59E0B]";
    case "canceled":
      return "bg-[#EF4444]";
    case "missed":
      return "bg-[#8B5CF6]";
    default:
      return "bg-[#6B7280]";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Fully Paid":
      return "text-green-600";
    case "Partially Paid":
      return "text-yellow-600";
    case "Refunded":
      return "text-green-600";
    case "Pending refund":
      return "text-yellow-600";
    default:
      return "";
  }
};

// Helper function to determine booking status for filtering
const determineBookingStatus = (booking: APIBooking): string => {
  const currentDate = new Date();
  const bookingDate = new Date(booking.date);

  if (booking.status === "canceled") {
    return "canceled";
  }

  if (booking.status === "pending") {
    return "missed"; // Treat pending bookings as missed if not confirmed
  }

  if (bookingDate < currentDate) {
    return "past";
  }

  if (booking.status === "confirmed" && bookingDate >= currentDate) {
    return "upcoming";
  }

  return "missed"; // Default to missed if none of the above conditions match
};

const MyBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<APIBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const TOKEN = `Token ${Cookies.get("accessToken")}`;

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${baseUrl}/bookings/my/`,
          {
            headers: {
              Authorization: TOKEN,
            },
          }
        );

        if (response.data.status === "success") {
          const apiBookings: APIBooking[] = response.data.data;

          // Map API response to the Booking interface
          const mappedBookings: Booking[] = apiBookings.map((booking) => ({
            id: booking.id.toString(),
            venue: booking.facility.name,
            location: booking.facility.address,
            status: determineBookingStatus(booking),
            paymentStatus:
              booking.payment.payment_status === "Fully Paid" &&
              booking.payment.payment_type === "full"
                ? "Fully Paid"
                : booking.payment.payment_status === "Fully Paid" &&
                  booking.payment.payment_type === "partial"
                ? "Partially Paid"
                : booking.payment.payment_status,
            price: parseFloat(booking.price),
            date: booking.date,
            time: booking.time,
          }));

          setBookings(mappedBookings);
          // Default filter to "upcoming"
          setFilteredBookings(
            mappedBookings.filter((b) => b.status === "upcoming")
          );
        } else {
          throw new Error(response.data.message || "Failed to fetch bookings");
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err.message || "An error occurred while fetching bookings");
        toast.error(err.message || "An error occurred while fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Update filtered bookings when the active tab changes
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.status === activeTab)
      );
    }
  }, [activeTab, bookings]);

  // Fetch detailed booking data when "Details" is clicked
  const handleDetailsClick = async (bookingId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/bookings/my/${bookingId}/`,
        {
          headers: {
            Authorization: TOKEN,
          },
        }
      );
      if (response.data.status === "success") {
        setSelectedBooking(response.data.data[0]); // Assuming single booking detail
        setIsModalOpen(true);
      } else {
        toast.error(response.data.message || "Failed to fetch booking details");
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      toast.error("An error occurred while fetching booking details");
    }
  };

  if (loading) {
    return <div className="text-center p-6 w-full">Loading bookings...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500 w-full">{error}</div>;
  }

  return (
    <div className="flex-1 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My bookings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="bg-transparent gap-2">
            <TabsTrigger
              value="upcoming"
              className="flex items-center gap-1 hover:border-primary border"
            >
              <span className="w-4 h-4 rounded-sm bg-primary"></span>
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex items-center gap-1 hover:border-primary border"
            >
              <span className="w-4 h-4 rounded-sm bg-[#F59E0B]"></span>
              Past
            </TabsTrigger>
            <TabsTrigger
              value="canceled"
              className="flex items-center gap-1 hover:border-primary border"
            >
              <span className="w-4 h-4 rounded-sm bg-[#EF4444]"></span>
              Canceled
            </TabsTrigger>
            <TabsTrigger
              value="missed"
              className="flex items-center gap-1 hover:border-primary border"
            >
              <span className="w-4 h-4 rounded-sm bg-[#8B5CF6]"></span>
              Missed
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="flex items-center gap-1 hover:border-primary border"
            >
              <span className="w-4 h-4 rounded-sm bg-[#6B7280]"></span>
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center p-6">No bookings found for this category.</div>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row">
                  <div className="pb-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{booking.venue},</h3>
                          <span className="text-sm text-gray-500">{booking.location}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm flex gap-2 justify-center items-center">
                        <p className="text-gray-500">Booking ID: {booking.id}</p>
                        <span
                          className={`w-4 h-4 rounded-sm -mr-1 ${getStatusBgColor(
                            booking.status
                          )}`}
                        ></span>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Subtotal */}
                    <div className="p-4 border rounded-lg flex justify-between items-center w-[250px]">
                      <div>
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-medium !mt-0">NRS {booking.price}</p>
                      </div>
                      <p
                        className={`text-sm ${getPaymentStatusColor(
                          booking.paymentStatus
                        )} !mt-0`}
                      >
                        {booking.paymentStatus}
                      </p>
                    </div>

                    {/* Booking Date */}
                    <div className="p-4 border rounded-lg flex flex-col justify-center w-[250px]">
                      <p className="text-sm text-gray-500">Booking Date</p>
                      <p className="font-medium !mt-0">{booking.date}</p>
                    </div>

                    {/* Slot */}
                    <div className="p-4 border rounded-lg flex flex-col justify-center w-[250px]">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500">Slot</p>
                        {booking.status === "upcoming" && (
                          <Link
                            to="/contact-us"
                            className="text-green-500 text-sm flex items-center"
                          >
                            Change
                            <Edit size={14} className="ml-1" />
                          </Link>
                        )}
                      </div>
                      <p className="font-medium !mt-0">{booking.time}</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="px-4 flex flex-col gap-2 justify-center">
                    <Button onClick={() => handleDetailsClick(booking.id)}>Details</Button>
                    {booking.status === "upcoming" && (
                      <Link to="/contact-us" className="text-primary">
                        <Button variant="outline" className="w-full text-red-500">
                          Cancel
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal for Booking Details */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "20px",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
        }}
        contentLabel="Booking Details"
        
     >
        {selectedBooking && (
          <div className="bg-background p-6 rounded-lg">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facility Information */}
              <div>
                <h3 className="text-lg font-semibold">Facility</h3>
                <p className="">Venue: {selectedBooking.facility.name}</p>
                <p className="">Location: {selectedBooking.facility.address}</p>
                <p className="">Type: {selectedBooking.facility.type}</p>
                <p className="">Surface: {selectedBooking.facility.surface}</p>
                <p className="">Size: {selectedBooking.facility.size}</p>
                <p className="">Capacity: {selectedBooking.facility.capacity}</p>
                <p className="">
                  Features: {selectedBooking.facility.features.join(", ") || "None"}
                </p>
              </div>
              {/* Booking Information */}
              <div>
                <h3 className="text-lg font-semibold">Booking</h3>
                <p className="">Booking ID: {selectedBooking.id}</p>
                <p className="">Date: {selectedBooking.date}</p>
                <p className="">Time: {selectedBooking.time}</p>
                <p className="">Price: NPR {parseFloat(selectedBooking.price).toFixed(2)}</p>
                <p className="">Status: {selectedBooking.status}</p>
              </div>
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold">Payment</h3>
                <p className="">Amount: NPR {parseFloat(selectedBooking.payment.amount).toFixed(2)}</p>
                <p className="">Total Amount: NPR {parseFloat(selectedBooking.payment.total_amount).toFixed(2)}</p>
                <p className="">Payment Status: {selectedBooking.payment.payment_status}</p>
                <p className="">Payment Type: {selectedBooking.payment.payment_type}</p>
                {selectedBooking.payment.transaction_code && (
                  <p className="">Transaction Code: {selectedBooking.payment.transaction_code}</p>
                )}
                {selectedBooking.payment.ref_id && (
                  <p className="">Reference ID: {selectedBooking.payment.ref_id}</p>
                )}
              </div>
              {/* Images */}
              {selectedBooking.facility.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBooking.facility.images.map((image) => (
                      <img
                        key={image.id}
                        src={`http://127.0.0.1:8000${image.image}`} // Adjust base URL as per your setup
                        alt={`Facility Image ${image.id}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBooking;