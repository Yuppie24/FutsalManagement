import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import ReviewComponent from "./ReviewComponent";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Star } from "lucide-react";
import futsalCourtVer from "/futsalCourtVer.jpg";
import { toast } from "sonner";
import { useUserStore } from "../../store/userStore";

interface slotProps {
  id: number;
  time: string;
  price: string;
  status: string;
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

interface BusinessInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  opening_time: string;
  closing_time: string;
  description: string;
  booking_notice: string;
  cancellation_policy: string;
  payment_options: string[];
}

interface Payment {
  id: number;
  payment_status: string;
}

interface BookingInfo {
  id: number;
  slot: slotProps;
  date: string;
  status: string;
  payment: Payment;
}

interface cardProps {
  facilityId: number;
  title: string;
  location: string;
  slotDuration: string;
  startingPrice: number;
  fieldType: string;
  date: string;
  rating: number;
  userHasReviewed: boolean;
  slotProps: slotProps[];
  reviews: Review[];
  BookingInfo?: BookingInfo[];
}

interface CustomCardProps {
  selectedCity: string | null;
  selectedFutsal: string | null;
  selectedDate: Date | undefined;
}

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

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const CustomCard = ({
  selectedCity,
  selectedFutsal,
  selectedDate,
}: CustomCardProps) => {
  const { userData } = useUserStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const handleCloseReviewDialog = () => {
    setIsReviewDialogOpen(false);
  };

  // Fetch facilities, time slots, and business info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilitiesRes, timeSlotsRes, businessInfoRes, bookingInfoRes] =
          await Promise.all([
            axios.get(`${baseUrl}/facilities/`),
            axios.get(`${baseUrl}/time-slots/`),
            axios.get(`${baseUrl}/business-info/`),
            axios.get(`${baseUrl}/bookings/`),
          ]);

        if (facilitiesRes.data.status === "success") {
          const reviews = await Promise.all(
            facilitiesRes.data.data.map(async (facility: Facility) => {
              const reviewData = await axios.get(
                `${baseUrl}/facilities/${facility.id}/reviews/retrieve/`
              );
              return {
                ...facility,
                reviews: reviewData.data.data,
              };
            })
          );
          setFacilities(reviews);
        } else {
          toast.error("Failed to fetch facilities");
          throw new Error("Failed to fetch facilities");
        }

        if (timeSlotsRes.data.status === "success") {
          setTimeSlots(timeSlotsRes.data.data);
        } else {
          toast.error("Failed to fetch time slots");
          throw new Error("Failed to fetch time slots");
        }

        if (businessInfoRes.data.status === "success") {
          setBusinessInfo(businessInfoRes.data.data[0]);
        } else {
          toast.error("Failed to fetch business info");
          throw new Error("Failed to fetch business info");
        }

        if (bookingInfoRes.data.status === "success") {
          setBookingInfo(bookingInfoRes.data.data);
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred while fetching data");
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
        toast.dismiss();
      }
    };
    fetchData();
  }, []);

  // Filter facilities based on search parameters
  const filteredFacilities = facilities.filter((facility) => {
    let matchesCity = true;
    let matchesFutsal = true;
    // Filter by city
    if (selectedCity) {
      const cityFromAddress = facility?.address.split(", ")[1]?.trim() || "";
      matchesCity =
        cityFromAddress.toLowerCase() === selectedCity.toLowerCase();
    }

    // Filter by futsal name
    if (selectedFutsal) {
      matchesFutsal =
        facility.name.toLowerCase() === selectedFutsal.toLowerCase();
    }

    if (selectedCity && selectedFutsal) {
      return matchesCity && matchesFutsal;
    }

    return matchesCity && matchesFutsal;
  });

  // Filter time slots based on selected date (if provided)
  const filteredTimeSlots = timeSlots.filter((slot) => {
    if (!selectedDate) return true; // If no date is selected, include all slots

    // Map the day of the selected date to the time slot's day
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const isWeekday = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ].includes(dayOfWeek);
    const isWeekend = ["Saturday", "Sunday"].includes(dayOfWeek);

    if (slot.day === "Weekdays" && isWeekday) return true;
    if (slot.day === "Weekends" && isWeekend) return true;
    if (slot.day === dayOfWeek) return true;
    return false;
  });

  // Process data to match cardProps structure
  const cardProps: cardProps[] = filteredFacilities.map((facility) => {
    // Filter time slots for the current facility and selected date
    const facilitySlots = filteredTimeSlots.filter(
      (slot) => slot.field === facility.id
    );

    // Filter booking info for the current slots and selected date
    const bookedSlots = bookingInfo
      .filter((booking) => {
        if (
          booking.payment.payment_status !== "Refunded" && booking.payment.payment_status !== "Pending Payment"
        ) {
          const date =
            selectedDate?.toISOString().split("T")[0] ||
            new Date().toISOString().split("T")[0];
          return booking.date === date;
        }
      })
      .map((booking) => booking.slot.id);

    // Calculate slot duration and props
    const slots = facilitySlots.map((slot) => ({
      id: slot.id,
      time: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
      price: slot.discounted_price || slot.price,
      status: bookedSlots.includes(slot.id) ? "booked" : slot.status,
    }));


    // Filter booking info for the current slots

    // Use selected date or current date
    const date = selectedDate
      ? selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const rating =
      Array.isArray(facility?.reviews) && facility.reviews.length > 0
        ? facility.reviews.reduce((sum, r) => sum + r.rating, 0) /
          facility.reviews.length
        : 0;

    // Calculate starting price as the minimum price from slots
    const startingPrice =
      facilitySlots.length > 0
        ? Math.min(
            ...facilitySlots.map((slot) =>
              parseFloat(slot.discounted_price || slot.price)
            )
          )
        : 0;

    // Calculate minimum slot duration
    const slotDuration =
      facilitySlots.length > 0
        ? Math.min(
            ...facilitySlots.map((slot) => {
              const [startHour, startMinute] = slot.start_time
                .split(":")
                .map(Number);
              const [endHour, endMinute] = slot.end_time.split(":").map(Number);
              const start = Date.UTC(1970, 0, 1, startHour, startMinute);
              const end = Date.UTC(1970, 0, 1, endHour, endMinute);
              return (end - start) / (1000 * 60 * 60);
            })
          )
        : 0;

    // Check if user has already reviewed the facility
    const userHasReviewed = Array.isArray(facility?.reviews)
      ? facility.reviews.some((review) => review.user === userData?.id)
      : false;

    return {
      facilityId: facility.id,
      title: facility.name,
      location: facility.address,
      slotDuration: slotDuration.toString(),
      startingPrice,
      fieldType: facility.type,
      date,
      slotProps: slots,
      rating,
      reviews: facility.reviews,
      userHasReviewed,
    };
  });

  // Calculate derived props
  const totalFutsalFields = filteredFacilities.length;
  const totalSlots = filteredTimeSlots.length;
  const minStartingPrice =
    cardProps.length > 0
      ? Math.min(...cardProps.map((card) => card.startingPrice))
      : 0;

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <p className="text-sm sm:text-base text-gray-600 mt-4 mb-4 text-center">
        {totalFutsalFields ?? 0} Futsal Fields and {totalSlots ?? 0} available
        slots in{" "}
        {selectedCity ||
          (businessInfo ? businessInfo.address.split(", ")[0] : "Pokhara")}{" "}
        Starts from Nrs {minStartingPrice ?? 0}
      </p>
      {cardProps.length === 0 ? (
        <div className="text-center p-6 text-gray-500">
          No futsal fields match your search criteria. Try adjusting your
          filters.
        </div>
      ) : (
        cardProps.map((cardProp, index) => {
          const facility = filteredFacilities[index];
          return (
            <Card className="shadow-lg mb-4" key={index}>
              <div className="flex">
                <CardContent className="w-full p-0">
                  <div className="flex flex-col lg:flex-row gap-4 p-4">
                    {/* Image Section */}
                    <div className="w-full lg:w-[40%]">
                      <img
                        src={
                          facility.thumbnail ||
                          (facility.images.length > 0
                            ? facility.images[0].image
                            : futsalCourtVer)
                        }
                        alt={cardProp.title}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-[60%]">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Court Details */}
                        <div className="w-full lg:w-1/3 space-y-2">
                          <h2 className="text-lg sm:text-xl font-bold flex justify-between items-center">
                            {cardProp.title}
                            <Dialog
                              open={isReviewDialogOpen}
                              onOpenChange={setIsReviewDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                  <Star
                                    className="mr-1 text-yellow-400"
                                    fill="gold"
                                  />
                                  <span className="underline text-sm">
                                    {cardProp.rating.toFixed(1)}
                                  </span>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="w-full md:max-w-4xl">
                                <ReviewComponent
                                  userHasReviewed={cardProp.userHasReviewed}
                                  facility={cardProp.title}
                                  facilityId={cardProp.facilityId}
                                  address={cardProp.location}
                                  onClose={handleCloseReviewDialog}
                                  reviews={cardProp.reviews}
                                />
                              </DialogContent>
                            </Dialog>
                          </h2>
                          <p className="text-gray-600 text-sm">
                            {cardProp.location}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">
                              Min Slot Duration:
                            </span>{" "}
                            {cardProp.slotDuration} hour
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">
                              Starting Price:
                            </span>{" "}
                            NRS {cardProp.startingPrice.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Field Type:</span>{" "}
                            {cardProp.fieldType}
                          </p>
                        </div>

                        {/* Slots Section */}
                        <div className="w-full lg:w-2/3 space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {cardProp.slotProps.map((slot, index) => (
                              <div key={index} className="relative">
                                <button
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className={`p-2 border rounded-lg text-center w-full ${
                                    selectedSlot === slot.id
                                      ? "border-green-500 bg-green-100 dark:bg-inherit"
                                      : "border-gray-300"
                                  }`}
                                  disabled={slot.status === "booked"}
                                >
                                  <p className="text-[10px] sm:text-[11px] text-gray-600 !mt-0">
                                    {slot.time}
                                  </p>
                                  <p className="text-xs sm:text-sm font-medium !mt-0">
                                    NRS {slot.price}
                                  </p>
                                </button>
                                {slot.status === "booked" && (
                                  <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center rounded-lg">
                                    <p className="text-[10px] sm:text-[11px] text-gray-600 !mt-0">
                                      {slot.time}
                                    </p>
                                    <p className="text-white text-xl sm:text-sm font-bold !mt-0">
                                      Booked
                                    </p>
                                  </div>
                                )}
                                {slot.status === "unavailable" && (
                                  <div className="absolute inset-0 bg-red-500 flex flex-col items-center justify-center rounded-lg">
                                    <p className="text-white text-xl sm:text-sm font-bold !mt-0">
                                      Unavailable
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto mb-2 sm:mb-0 cursor-not-allowed"
                            >
                              {cardProp.date}
                            </Button>
                            <Link
                              to={`/booking/${facility.id}/${selectedSlot}?date=${cardProp.date}`}
                              className="w-full sm:w-auto"
                            >
                              <Button className="bg-green-500 w-full sm:w-auto"
                              disabled={selectedSlot === null}
                              >
                                Book Online
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default CustomCard;
