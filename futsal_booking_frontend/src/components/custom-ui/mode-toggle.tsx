import { useTheme } from "../../context/ThemeContext";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Toggle between "light" and "dark"
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? (
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
