import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import useCheckIfLoggedIn from "../../hooks/useCheckIfLoggedIn";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-12", className)}
      {...props}
    >
      <Link
        to="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-foreground"
        )}
      >
        Home
      </Link>
      {useCheckIfLoggedIn() && (
        <Link
          to="/my-bookings"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/my-bookings" ? "text-primary" : "text-foreground"
          )}
        >
          My Bookings
        </Link>
      )}
      <Link
        to="/contact-us"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/contact-us" ? "text-primary" : "text-foreground"
        )}
      >
        Contact Us
      </Link>
      <Link
        to="/terms-and-conditions"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/terms-and-conditions"
            ? "text-primary"
            : "text-foreground"
        )}
      >
        Terms and Conditions
      </Link>
    </nav>
  );
}
