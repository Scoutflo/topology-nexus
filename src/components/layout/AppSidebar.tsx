import { 
  Network, 
  Server, 
  Database, 
  Plug, 
  History, 
  Lightbulb,
  Zap,
  ChevronRight
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const topologyItems = [
  { title: "Topology Viewer", url: "/", icon: Network },
  { title: "Services", url: "/services", icon: Server },
  { title: "Infrastructure", url: "/infrastructure", icon: Database },
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Change History", url: "/history", icon: History },
  { title: "Discovery Suggestions", url: "/discovery", icon: Lightbulb },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isTopologyActive = topologyItems.some(item => location.pathname === item.url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Scoutflo</span>
            <span className="text-xs text-muted-foreground">AI SRE Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                asChild
                defaultOpen={isTopologyActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Topology"
                      className={isTopologyActive ? "font-medium" : ""}
                    >
                      <Network className="h-4 w-4" />
                      <span>Topology</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {topologyItems.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                            >
                              <button
                                onClick={() => navigate(item.url)}
                                className="flex w-full items-center gap-2"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Version 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
