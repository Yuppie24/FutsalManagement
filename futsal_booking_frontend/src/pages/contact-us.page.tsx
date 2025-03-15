import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { MailIcon, MapIcon, PhoneIcon } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="lg:max-w-[80%] mx-auto p-4">
      <Card className={"md:p-6 py-6"}>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Get in touch</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Feel free to leave any enquiries below, or give us a call to
                speak with our helpful sales team.
              </p>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="max-md:px-2">
                  <h3 className="text-2xl font-bold">Contact Details</h3>
                </CardHeader>
                <CardContent className="max-md:px-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapIcon className="w-4 h-4" />
                      <span>1234 Street, City, State, 56789</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4" />
                      <span>(123) 456-7890</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MailIcon className="w-4 h-4" />
                      <Link
                        to="mailto:info@example.com"
                        className="text-blue-500 underline"
                      >
                        info@example.com
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="max-md:px-2">
                  <h3 className="text-2xl font-bold">Leave a Message</h3>
                </CardHeader>
                <CardContent className="max-md:px-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                    />
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message"
                      className="min-h-[100px]"
                    />
                    <Button>Send message</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
