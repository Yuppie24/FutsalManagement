import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";

interface Framework {
  value: string;
  label: string;
}

interface ComboboxProps {
  frameworks: Framework[];
  labelName: string;
  searchLabel: string;
  notFoundLabel: string;
  icon: React.ReactNode;
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function Combobox({
  frameworks,
  labelName,
  searchLabel,
  notFoundLabel,
  icon,
  value,
  onValueChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] text-left font-normal justify-between max-md:w-full",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex overflow-hidden">
            {icon}
            {value
              ? frameworks.find((framework) => framework.value === value)?.label
              : `${labelName}`}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchLabel} />
          <CommandList>
            <CommandEmpty>{notFoundLabel}</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.label} // Set value to label for search filtering
                  onSelect={() => {
                    const newValue = framework.value === value ? null : framework.value;
                    onValueChange(newValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}