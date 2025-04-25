
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
import { LucideGolf, Home, Award, Dumbbell, Calendar, Clock, Brain, List, User } from "./icons/CustomIcons";

interface AppSidebarProps {
  currentPath?: string;
}

const AppSidebar = ({ currentPath }: AppSidebarProps) => {
  console.log("AppSidebar rendered with currentPath:", currentPath);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
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
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === "/drills"}
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
                >
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          © 2025 ChipAway - v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
