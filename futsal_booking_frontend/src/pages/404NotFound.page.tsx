import { Link } from "react-router-dom";
import refereeYellowCard from "/refereeYellowCard.jpg";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="flex flex-grow w-full flex-col items-center justify-center md:flex-row md:justify-center bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${refereeYellowCard})` }}
      >
        <div className="flex text-white absolute flex-col items-center justify-center gap-4">
          <div className="gap-0 text-center leading-tight text-12px md:text-[48px] ">
            <div>404</div>
            <div>Page Not Found</div>
          </div>
          <div className="max-w-[564px] text-center text-12px sm:text-2xl">
            "Oops! Page not found. Return home to continue browsing."
          </div>
          <Link
            to="/"
            className="mt-4 flex bg-primary w-full justify-center rounded-xl sm:px-8 py-3 text-base text-white largeMobile:mb-12"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
