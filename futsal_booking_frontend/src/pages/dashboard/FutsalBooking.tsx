import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import PageLayout from "../../layout/PageLayout";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import UserProfileImage from "/svg/user-profile.svg";
import useRedirectIfOwnerLoggedIn from "../../hooks/useRedirectIfOwnerLoggedIn";

// Interfaces for the API response
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

interface APICustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
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
  customer: APICustomer;
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
  customerName: string;
  customerPhone: string;
  venue: string;
  location: string;
  status: string;
  paymentStatus: string;
  price: number;
  date: string;
  time: string;
  createdAt: string;
  image?: string;
  transactionId?: string;
}
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "text-green-600 bg-green-100";
    case "completed":
      return "text-blue-600 bg-blue-100";
    case "canceled":
      return "text-red-600 bg-red-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Fully Paid":
      return "text-green-600";
    case "Partially Paid":
      return "text-yellow-600";
    case "Refunded":
      return "text-blue-600";
    case "Pending Payment":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const FutsalOwnerBookings = () => {
  useRedirectIfOwnerLoggedIn();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const TOKEN = `Token ${Cookies.get("accessToken")}`; // Adjust token retrieval as per your app

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${baseUrl}/bookings`, {
          headers: {
            Authorization: TOKEN,
          },
        });

        if (response.data.status === "success") {
          const apiBookings: APIBooking[] = response.data.data;

          // Map API response to the Booking interface
          const mappedBookings: Booking[] = apiBookings.map((booking) => ({
            id: booking.id.toString(),
            customerName: booking.customer.name,
            customerPhone: booking.customer.phone,
            venue: booking.facility.name,
            location: booking.facility.address,
            status: booking.status,
            paymentStatus: booking.payment.payment_status,
            price: parseFloat(booking.price),
            date: booking.date,
            time: booking.time,
            createdAt: booking.created_at.split("T")[0], // Extract date part
            image: booking.customer.avatar || UserProfileImage, // Fallback image
            transactionId: booking.payment.transaction_code || "",
          }));

          setBookings(mappedBookings);
          setFilteredBookings(mappedBookings);
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

  // Filter bookings based on search query and selected date
  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const matchesSearch =
        booking.customerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerPhone.includes(searchQuery);

      const matchesDate = selectedDate ? booking.date === selectedDate : true;

      return matchesSearch && matchesDate;
    });

    setFilteredBookings(filtered);
  }, [searchQuery, selectedDate, bookings]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const getFilteredBookingsByStatus = (status: string) => {
    if (status === "all") return filteredBookings;
    return filteredBookings.filter((booking) => booking.status === status);
  };

  // Update booking status
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        `${baseUrl}/bookings/${bookingId}/update-status/`,
        { status: newStatus },
        {
          headers: {
            Authorization: TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        setFilteredBookings((prevFiltered) =>
          prevFiltered.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
        toast.success(`Booking status updated to ${newStatus}`);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      toast.error(err.message || "An error occurred while updating the status");
    }
  };

  // Handle Confirm, Decline, and Mark as Completed actions
  const handleConfirm = (bookingId: string) =>
    handleStatusUpdate(bookingId, "confirmed");
  const handleDecline = (bookingId: string) =>
    handleStatusUpdate(bookingId, "canceled");
  const handleMarkAsCompleted = (bookingId: string) =>
    handleStatusUpdate(bookingId, "completed");

  if (error) {
    return <div className="text-center p-6 text-red-500 w-full">{error}</div>;
  }

  return (
    <PageLayout title="Bookings">
      <div className="flex-1 p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Futsal Booking Management</h1>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by name, ID, phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Input
                type="date"
                className="w-full md:w-40"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </header>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : (
          <>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-transparent gap-2 sm:mb-6 mb-16 flex flex-wrap">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-1 hover:border-primary border"
                >
                  <span className="w-4 h-4 rounded-sm bg-[#6B7280]"></span>
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="confirmed"
                  className="flex items-center gap-1 hover:border-primary border"
                >
                  <span className="w-4 h-4 rounded-sm bg-[#22c55e]"></span>
                  Confirmed
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-1 hover:border-primary border"
                >
                  <span className="w-4 h-4 rounded-sm bg-[#F59E0B]"></span>
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center gap-1 hover:border-primary border"
                >
                  <span className="w-4 h-4 rounded-sm bg-[#0ea5e9]"></span>
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="canceled"
                  className="flex items-center gap-1 hover:border-primary border"
                >
                  <span className="w-4 h-4 rounded-sm bg-[#EF4444]"></span>
                  Canceled
                </TabsTrigger>
              </TabsList>

              {["all", "confirmed", "pending", "completed", "canceled"].map(
                (status) => (
                  <TabsContent
                    key={status}
                    value={status}
                    className="space-y-4 mt-0"
                  >
                    {getFilteredBookingsByStatus(status).length === 0 ? (
                      <div className="text-center py-10 border border-dashed rounded-lg">
                        <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium">
                          No bookings found
                        </h3>
                        <p className="text-gray-500">
                          No {status !== "all" ? status : ""} bookings match
                          your search criteria.
                        </p>
                      </div>
                    ) : (
                      getFilteredBookingsByStatus(status).map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex flex-col space-y-4">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                <div className="flex gap-2">
                                  <img
                                    src={booking.image}
                                    className="rounded-full w-8 h-8"
                                    alt={booking.customerName}
                                  />
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold flex gap-2">
                                      {booking.customerName}
                                    </h3>
                                    <p className="text-sm text-gray-500 !mt-0">
                                      {booking.customerPhone}
                                    </p>
                                    <Badge
                                      className={`${getStatusColor(
                                        booking.status
                                      )}`}
                                    >
                                      {booking.status.charAt(0).toUpperCase() +
                                        booking.status.slice(1)}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-500 !mt-0">
                                    Booking ID: {booking.id}
                                  </p>
                                  <p className="text-sm text-gray-500 !mt-0">
                                    Booked on: {booking.createdAt}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                {/* Venue */}
                                <div className="p-4 border rounded-lg flex flex-col justify-between">
                                  <p className="text-sm text-gray-500">Venue</p>
                                  <p className="font-medium !mt-0">
                                    {booking.venue}, {booking.location}
                                  </p>
                                </div>

                                {/* Payment */}
                                <div className="p-4 border rounded-lg flex flex-col justify-between">
                                  <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">
                                      Payment
                                    </p>
                                    <p
                                      className={`text-sm ${getPaymentStatusColor(
                                        booking.paymentStatus
                                      )} !mt-0`}
                                    >
                                      {booking.paymentStatus}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    NRS {booking.price}
                                  </p>
                                </div>

                                {/* Booking Date */}
                                <div className="p-4 border rounded-lg justify-between flex flex-col">
                                  <p className="text-sm text-gray-500">
                                    Booking Date
                                  </p>
                                  <p className="font-medium flex items-center gap-1 !mt-0">
                                    <Calendar size={14} />
                                    {booking.date}
                                  </p>
                                </div>

                                {/* Time Slot */}
                                <div className="p-4 border rounded-lg flex flex-col justify-between">
                                  <p className="text-sm text-gray-500">
                                    Time Slot
                                  </p>
                                  <p className="font-medium flex items-center gap-1">
                                    <Clock size={14} />
                                    {booking.time}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end gap-2 pt-2 max-sm:flex-col">
                                {booking.status === "pending" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      className="text-green-600"
                                      onClick={() => handleConfirm(booking.id)}
                                    >
                                      <CheckCircle size={16} className="mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="text-red-600"
                                      onClick={() => handleDecline(booking.id)}
                                    >
                                      <XCircle size={16} className="mr-1" />
                                      Decline
                                    </Button>
                                  </>
                                )}
                                {booking.status === "confirmed" && (
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      handleMarkAsCompleted(booking.id)
                                    }
                                  >
                                    <CheckCircle size={16} className="mr-1" />
                                    Mark as Completed
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleViewDetails(booking)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="max-w-full w-full md:max-w-3xl p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                  <DialogDescription>
                    Complete information about this booking.
                  </DialogDescription>
                </DialogHeader>

                {selectedBooking && (
                  <div className="space-y-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedBooking.image}
                          className="rounded-full w-8 h-8"
                          alt={selectedBooking.customerName}
                        />
                        <div>
                          <h2 className="text-xl font-semibold mb-1">
                            {selectedBooking.customerName}
                          </h2>
                          <p className="text-gray-600 !mt-0">
                            {selectedBooking.customerPhone}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(selectedBooking.status)}`}
                      >
                        {selectedBooking.status.charAt(0).toUpperCase() +
                          selectedBooking.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-3">
                          Booking Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Booking ID</span>
                            <span>{selectedBooking.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Venue</span>
                            <span>{selectedBooking.venue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Location</span>
                            <span>{selectedBooking.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span>{selectedBooking.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Time</span>
                            <span>{selectedBooking.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created On</span>
                            <span>{selectedBooking.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-3">
                          Payment Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Amount</span>
                            <span>NRS {selectedBooking.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span
                              className={getPaymentStatusColor(
                                selectedBooking.paymentStatus
                              )}
                            >
                              {selectedBooking.paymentStatus}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Payment Method
                            </span>
                            <span>
                              {selectedBooking.paymentStatus ===
                              "Pending Payment"
                                ? "N/A"
                                : "Online Payment"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Transaction ID
                            </span>
                            <span>
                              {selectedBooking.transactionId || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Update Booking Status</h3>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={selectedBooking.status}
                          onValueChange={(value) =>
                            handleStatusUpdate(selectedBooking.id, value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() =>
                            handleStatusUpdate(
                              selectedBooking.id,
                              selectedBooking.status
                            )
                          }
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default FutsalOwnerBookings;
