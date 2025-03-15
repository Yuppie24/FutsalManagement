import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronRight, LucideIcon } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu className="m-0">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem className="list-none">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  {item.title}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items?.length ? (
                <CollapsibleContent className="-mt-8 ml-4">
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem
                        key={item.title}
                        className="list-none"
                      >
                        <SidebarMenuSubButton asChild>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
