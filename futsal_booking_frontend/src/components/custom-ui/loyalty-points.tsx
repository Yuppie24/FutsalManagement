import { GiCrownCoin } from "react-icons/gi";
import { Button } from "../ui/button";

export function LoyaltyPoints() {
  return (
    <Button >
      <GiCrownCoin color="yellow" className="bg-black rounded-full" />
      <span className="-ml-1">500 pt</span>
    </Button>
  );
}
