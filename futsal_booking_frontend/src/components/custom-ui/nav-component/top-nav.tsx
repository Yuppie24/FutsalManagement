import { GiSoccerBall } from "react-icons/gi";
import { LoyaltyPoints } from "../loyalty-points";
import { MainNav } from "../main-nav";
import { ModeToggle } from "../mode-toggle";
import UserIcon from "../user-nav";
import useCheckIfLoggedIn from "../../../hooks/useCheckIfLoggedIn";
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../../ui/sidebar";
import { MainSidebar } from "../../containers/MainSideBar";

export function TopNavbar() {
  return (
    <>
      <div className="flex-col md:flex sticky top-0 z-50 bg-background dark:bg-background max-md:hidden">
        <div className="border-b">
          <div className="flex h-20 items-center px-4">
            <Link to="/">
              <i className="flex items-center text-3xl font-bold text-primary">
                Futsal{" "}
                <span>
                  <GiSoccerBall />
                </span>
                Booking
              </i>
            </Link>
            <div className="ml-auto flex items-center space-x-4">
              <MainNav className="mx-6" />
              <ModeToggle />
              {useCheckIfLoggedIn() ? (
                <>
                  {" "}
                  <LoyaltyPoints />
                  <UserIcon />
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button>Sign In</Button>
                  </Link>
                  <Link to="/auth/sign-up">
                    <Button variant={"outline"}>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <SidebarProvider className="md:hidden min-h-fit">
        <MainSidebar />
        <header className="sticky top-0 bg-background z-50 flex h-16 shrink-0 items-center gap-2 px-4 justify-between w-full">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <div className="flex items-center gap-2">
            <ModeToggle />
            {useCheckIfLoggedIn() && <UserIcon />}
          </div>
        </header>
      </SidebarProvider>
    </>
  );
}
