import MyBooking from "../components/custom-ui/my-booking";
import ProfileSideBar from "../components/custom-ui/profile-sidebar";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen p-8">
      <ProfileSideBar />
      <MyBooking/>
    </div>
  );
}
