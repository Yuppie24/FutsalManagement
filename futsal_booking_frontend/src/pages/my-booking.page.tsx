import MyBooking from "../components/custom-ui/my-booking";
import useProtectRoutes from "../hooks/useProtectRoutes";

export default function MyBookingPage() {
  useProtectRoutes();
  return (
    <div className="flex min-h-screen p-8">
      <MyBooking />
    </div>
  );
}
