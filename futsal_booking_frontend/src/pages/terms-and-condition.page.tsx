import { ChevronDown } from "lucide-react";
import { Separator } from "../components/ui/separator";

export default function TermsAndConditionsPage() {
  return (
    <div className="py-6">
      <div className="container px-4 md:px-6">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <div className="pb-4 space-y-2 dark:border-gray-800">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Terms and Conditions
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: March 2, 2025
            </p>
          </div>
          <Separator className="my-2" />
          <div className="mx-auto prose max-w-none">
            <div className="pb-4">
              <p>
                These terms and conditions outline the rules and regulations for
                the use of our Futsal Booking App.
              </p>
              <p>
                By accessing this app, we assume you accept these terms and
                conditions. Do not continue to use the app if you do not agree
                to take all of the terms and conditions stated on this page.
              </p>
            </div>
            <Separator className="my-2" />
            <div className="pb-4">
              <h2>Booking Policy</h2>
              <p>
                - All bookings are subject to availability.
              </p>
              <p>
                - Bookings must be made at least 24 hours in advance.
              </p>
              <p>
                - Cancellations made within 12 hours of the booking time are non-refundable.
              </p>
              <p>
                - Users must provide accurate information while booking.
              </p>
            </div>
            <Separator className="my-2" />
            <div className="pb-4">
              <h2>Payments</h2>
              <p>
                - All payments must be made through the app.
              </p>
              <p>
                - Refunds will be processed within 5-7 business days for eligible cancellations.
              </p>
              <p>
                - The app does not store any payment details.
              </p>
            </div>
            <Separator className="my-2" />
            <div className="pb-4">
              <h2>Code of Conduct</h2>
              <p>
                - Users must follow the rules of the futsal facility.
              </p>
              <p>
                - Any damage caused to the property will be the responsibility of the user.
              </p>
              <p>
                - Offensive behavior will result in a permanent ban from the app.
              </p>
            </div>
            <Separator className="my-2" />
            <div className="pb-4">
              <h2>Privacy Policy</h2>
              <p>
                - We collect personal information solely for the purpose of providing the service.
              </p>
              <p>
                - User data will not be shared with third parties without consent.
              </p>
              <p>
                - The app implements industry-standard security measures to protect user data.
              </p>
            </div>
            <Separator className="my-2" />
            <div className="pb-4">
              <h2>Dispute Resolution</h2>
              <p>
                - Any disputes will be subject to the laws of the country where the service operates.
              </p>
              <p>
                - Users are encouraged to contact customer support for any complaints or issues.
              </p>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="mx-auto max-w-[80%] space-y-4">
            <h2 className="text-2xl font-bold">FAQs</h2>
            <div className="space-y-4">
              <details>
                <summary className="font-medium list-none cursor-pointer flex justify-between">
                  How do I make a booking?
                  <span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </span>
                </summary>
                <p>{"->"} Bookings can be made through the app's booking section.</p>
              </details>
              <Separator />
              <details>
                <summary className="font-medium list-none cursor-pointer flex justify-between">
                  What is the cancellation policy?
                  <span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </span>
                </summary>
                <p>{"->"} Cancellations made within 12 hours are non-refundable.</p>
              </details>
              <Separator />
              <details>
                <summary className="font-medium list-none cursor-pointer flex justify-between">
                  How do I contact support?
                  <span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </span>
                </summary>
                <p>{"->"} You can contact support through the app's help section.</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
