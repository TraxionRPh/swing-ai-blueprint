import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Icons } from "@/components/icons";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

const Layout = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const currentPath = location.pathname;
  console.log("Layout rendered, currentPath:", currentPath);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen w-full">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" className="px-2.5">
                  <Icons.menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] p-0"
              >
                <AppSidebar currentPath={currentPath} />
              </SheetContent>
            </Sheet>
            
            <div className="ml-auto flex items-center space-x-4">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Avatar"} />
                      <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "AV"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/subscription")}>
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center justify-between w-full">
                      <span>Theme</span>
                      <ModeToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <div className="container relative flex min-h-[calc(100vh-theme(spacing.14))]">
          <aside className="hidden w-[280px] border-r md:block">
            <AppSidebar currentPath={currentPath} />
          </aside>
          <main className="flex-1 overflow-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
