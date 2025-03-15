import { BookOpen, Check, ChevronRight, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

function ProfileSideBar() {
  return (
    <Card className="w-64 p-4 border-r flex flex-col items-center">
      <div className="flex flex-col items-center mb-8 pt-4">
        <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
          <AvatarImage src="/pokemon.png" alt="@avatar"/>
          <AvatarFallback className="text-2xl">
            <div className="flex items-center justify-center h-full">
             <Check />
            </div>
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">Soul Xettri</h2>
      </div>

      <nav className="w-full space-y-1">
        <Button variant="ghost" className="w-full justify-start py-6" asChild>
          <div className="flex items-center space-x-3">
            <User size={20} className="text-gray-500" />
            <span>Profile</span>
            <ChevronRight size={18} className="ml-auto" />
          </div>
        </Button>

        <Button
          variant="default"
          className="w-full justify-start py-6 bg-green-500 hover:bg-green-600"
          asChild
        >
          <div className="flex items-center space-x-3">
            <BookOpen size={20} />
            <span>My bookings</span>
            <ChevronRight size={18} className="ml-auto" />
          </div>
        </Button>
      </nav>
    </Card>
  );
}

export default ProfileSideBar;
