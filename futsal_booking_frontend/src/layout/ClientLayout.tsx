import { Outlet } from "react-router-dom";
import { TopNavbar } from "../components/custom-ui/nav-component/top-nav";
import ScrollToTop from "../components/custom-ui/ScrollToTop";

export default function ClientLayout() {
  return (
    <div>
      <TopNavbar />
      <ScrollToTop />
      <Outlet />
    </div>
  );
}
