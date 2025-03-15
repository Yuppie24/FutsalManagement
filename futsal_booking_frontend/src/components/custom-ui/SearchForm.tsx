import { Search } from "lucide-react";

import { Label } from "../ui/label";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "../ui/sidebar";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="p-0">
        <SidebarGroupContent className="relative ">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the docs..."
            className="pl-8 rounded-[12px] py-2 "
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
