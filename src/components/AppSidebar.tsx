import { Link } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { LucideGolf, Home, Award, Dumbbell, Calendar, Brain, List, User } from "./icons/CustomIcons";

interface AppSidebarProps {
  currentPath?: string;
}

const AppSidebar = ({ currentPath }: AppSidebarProps) => {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2 text-sidebar-foreground">
          <LucideGolf className="h-8 w-8 text-primary" />
          <h1 className="font-bold text-xl">ChipAway</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <Link to="/dashboard" className="text-sidebar-foreground">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/drills"}
                  tooltip="Drill Library"
                >
                  <Link to="/drills">
                    <Dumbbell className="h-5 w-5" />
                    <span>Drill Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/challenges"}
                  tooltip="Challenge Library"
                >
                  <Link to="/challenges">
                    <Award className="h-5 w-5" />
                    <span>Challenge Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Training</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/practice-plans"}
                  tooltip="Practice Plans"
                >
                  <Link to="/practice-plans">
                    <Calendar className="h-5 w-5" />
                    <span>Practice Plans</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/rounds"}
                  tooltip="Round Tracking"
                >
                  <Link to="/rounds">
                    <List className="h-5 w-5" />
                    <span>Round Tracking</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/ai-analysis"}
                  tooltip="AI Analysis"
                >
                  <Link to="/ai-analysis">
                    <Brain className="h-5 w-5" />
                    <span>AI Analysis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/profile"}
                  tooltip="Profile"
                >
                  <Link to="/profile" className="text-sidebar-foreground">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-xs text-sidebar-foreground/60">
          © 2025 ChipAway - v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
