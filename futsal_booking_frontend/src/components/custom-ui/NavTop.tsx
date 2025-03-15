import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Link } from "react-router-dom";

export function NavTop({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu className="m-0">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} className="list-none">
            <SidebarMenuButton asChild>
              <Link to={item.url}>
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
