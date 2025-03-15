import { Toaster } from "sonner";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home.page";
import NotFoundPage from "./pages/404NotFound.page";
import ProfilePage from "./pages/profile.page";
import MyBookingPage from "./pages/my-booking.page";
import Login from "./pages/auth/Login";
import AuthLayout from "./layout/AuthLayout";
import SignUp from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetPasswordOTP from "./pages/auth/ResetPasswordOTP";
import SetNewPassword from "./pages/auth/SetNewPassword";
import EmailVerifyOTP from "./pages/auth/EmailVerify";
import ChangePassword from "./pages/auth/ChangePassword";
import BookingPage from "./pages/booking.page";
import BookingConfirmation from "./pages/booking-confirmation.page";
import ContactUsPage from "./pages/contact-us.page";
import TermsAndConditionsPage from "./pages/terms-and-condition.page";
import Dashboard from "./pages/dashboard/Dashboard";
import MainLayout from "./layout/MainLayout";
import ClientLayout from "./layout/ClientLayout";
import FutsalInformationPage from "./pages/dashboard/Futsal";
import GalleryPage from "./pages/dashboard/Gallery";
import FutsalOwnerBookings from "./pages/dashboard/FutsalBooking";
import Reviews from "./pages/dashboard/Reviews";
import DashBoardNotFoundPage from "./pages/DashboardNotFound.page";
import SuccessHandler from "./handler/paymentSuccess";
import BookingFailure from "./pages/booking-failure.page";

function App() {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="futsal" element={<FutsalInformationPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="bookings" element={<FutsalOwnerBookings />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="*" element={<DashBoardNotFoundPage />} />
        </Route>
        <Route path="/" element={<ClientLayout />}>
          <Route path="auth" element={<AuthLayout />}>
            <Route index element={<Login />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route
              path="reset-password/verify"
              element={<ResetPasswordOTP />}
            />
            <Route
              path="reset-password/set-new-password"
              element={<SetNewPassword />}
            />
            <Route path="email-verify" element={<EmailVerifyOTP />} />
            <Route
              path="change-password"
              element={
                // <ProtectedRoute>
                <ChangePassword />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route index element={<HomePage />} />
          <Route path="my-bookings" element={<MyBookingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contact-us" element={<ContactUsPage />} />
          <Route
            path="terms-and-conditions"
            element={<TermsAndConditionsPage />}
          />
          <Route path="booking/:facilityId/:slotId" element={<BookingPage />} />
          <Route path="success">
            <Route index element={<SuccessHandler />} />
            <Route path=":facilityId/:slotId/:bookingId" element={<BookingConfirmation />} />
          </Route>
          <Route path="failure">
            <Route path=":facilityId/:slotId/:bookingId" element={<BookingFailure />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
