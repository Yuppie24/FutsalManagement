import * as React from "react";
import { SearchForm } from "../custom-ui/SearchForm";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import { Images, LayoutDashboard, Megaphone, Triangle, Volleyball } from "lucide-react";
import { NavTop } from "../custom-ui/NavTop";
import { Separator } from "../ui/separator";
import { GiSoccerBall } from "react-icons/gi";
import { Link } from "react-router-dom";

const data = {
projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Futsal",
      url: "/dashboard/futsal",
      icon: Volleyball,
    },
    {
      name: "Gallery",
      url: "/dashboard/gallery",
      icon: Images
    },
    {
      name: "Bookings",
      url: "/dashboard/bookings",
      icon: Triangle,
    },
    {
      name: "Reviews",
      url: "/dashboard/reviews",
      icon: Megaphone,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu className="m-0">
          <SidebarMenuItem className="list-none self-center">
            <Link to="/">
              <h1 className="text-primary text-3xl cursor-pointer flex mb-3">
                Futsal{" "}
                <span>
                  <GiSoccerBall />
                </span>
                Booking
              </h1>
            </Link>
          </SidebarMenuItem>
          <Separator className="-mt-1 mb-4 ml-2 h-[2px] w-[90%]" />
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <Separator className="mt-4 mb-0 ml-4 h-[2px] w-[86%]" />
        <NavTop projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
