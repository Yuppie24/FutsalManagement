import { useState, useEffect } from "react";
import { DatePicker } from "../../ui/date-picker";
import futsalCourtVer from "/futsalCourtVer.jpg";
import { Combobox } from "../../ui/combo-box";
import { cities } from "../../../utils/cities-list";
import { LoaderPinwheel, MapPin, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import axios from "axios";

interface HeroProps {
  selectedCity: string | null;
  setSelectedCity: (value: string | null) => void;
  selectedFutsal: string | null;
  setSelectedFutsal: (value: string | null) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
}

interface Facility {
  id: number;
  name: string;
  address: string;
  type: string;
  surface: string;
  size: string;
  capacity: number;
  status: string;
  thumbnail: string;
  images: { id: number; image: string; facility: number }[];
}
const baseUrl = import.meta.env.VITE_API_BASE_URL;
export function Hero({
  selectedCity,
  setSelectedCity,
  selectedFutsal,
  setSelectedFutsal,
  selectedDate,
  setSelectedDate,
}: HeroProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(`${baseUrl}/facilities/`);
        if (response.data.status === "success") {
          setFacilities(response.data.data);
        } else {
          throw new Error("Failed to fetch facilities");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching facilities");
      } finally {
      }
    };
    fetchFacilities();
  }, []);

  // Format facilities for Combobox
  const futsalOptions = facilities.map((facility) => ({
    label: `${facility.name}`,
    value: facility.name.toString(), // Use ID as value for uniqueness
  }));

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${futsalCourtVer})` }}
    >
      <div className="bg-[rgba(27,33,39,0.5)] absolute h-full w-full top-0 right-0" />
      <div className="z-10 w-[90%] md:w-[80%] lg:w-[60%] flex flex-col items-center justify-center">
        <div className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex flex-wrap justify-center space-x-2 md:space-x-3 tracking-widest text-center mb-4">
          <span>Find</span>
          <span>Nearby</span>
          <span>Futsal</span>
          <span>Fields</span>
        </div>
        <Card className="w-full flex flex-col md:flex-row justify-center items-center p-4 md:p-6 space-y-4 md:space-y-0 md:space-x-4 shadow-lg">
          <div className="w-full md:w-1/4 flex justify-center">
            <Combobox
              frameworks={cities}
              icon={<MapPin className="mr-2 h-4 w-4" />}
              labelName="Pick a city"
              searchLabel="Search city"
              notFoundLabel="No city found"
              value={selectedCity}
              onValueChange={setSelectedCity}
            />
          </div>
          <div className="w-full md:w-1/4 flex justify-center">
            <Combobox
              frameworks={futsalOptions}
              icon={<LoaderPinwheel className="mr-2 h-4 w-4" />}
              labelName="Pick a futsal"
              searchLabel="Search futsal"
              notFoundLabel="No futsal found"
              value={selectedFutsal}
              onValueChange={setSelectedFutsal}
            />
          </div>
          <div className="w-full md:w-1/4 flex justify-center">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
          <div className="w-full md:w-1/4 flex justify-center">
            <Button
              className="w-full cursor-pointer"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}