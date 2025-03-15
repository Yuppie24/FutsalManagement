import { useState } from "react";
import CustomCard from "../components/custom-ui/custom-card";
import { Hero } from "../components/custom-ui/hero/hero";

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedFutsal, setSelectedFutsal] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedFutsal={selectedFutsal}
        setSelectedFutsal={setSelectedFutsal}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="flex w-full justify-center lg:p-10">
        <CustomCard
          selectedCity={selectedCity}
          selectedFutsal={selectedFutsal}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}