import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/containers/AppSideBar";

export default function MainLayout() {
  return (
    <div className="flex">
      <SidebarProvider>
        <AppSidebar />
        <Outlet />
      </SidebarProvider>
    </div>
  );
}
