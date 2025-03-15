import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import { NavTop } from "../custom-ui/NavTop";
import { Separator } from "../ui/separator";
import { GiSoccerBall } from "react-icons/gi";
import { Link } from "react-router-dom";
import useCheckIfLoggedIn from "../../hooks/useCheckIfLoggedIn";
import { LoyaltyPoints } from "../custom-ui/loyalty-points";
import { Button } from "../ui/button";

const data = {
  projects: [
    {
      name: "Home",
      url: "/",
    },
    {
      name: "Contact Us",
      url: "/contact-us",
    },
    {
      name: "Terms and Conditions",
      url: "/terms-and-conditions",
    },
  ],
};

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu className="m-0">
          <SidebarMenuItem className="list-none self-center">
            <Link to="/">
              <h1 className="text-primary text-3xl cursor-pointer flex">
                Futsal{" "}
                <span>
                  <GiSoccerBall />
                </span>
                Booking
              </h1>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Separator className="mb-0 ml-4 h-[2px] w-[86%]" />
        <NavTop projects={data.projects} />
        {useCheckIfLoggedIn() ? (
          <div className="flex flex-col gap-4 mt-4">
            {" "}
            <LoyaltyPoints />
          </div>
        ) : (
          <div className="flex flex-col w-full gap-4 mt-4">
            <Link to="/auth" className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link to="/auth/sign-up" className="w-full">
              <Button variant={"outline"} className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
