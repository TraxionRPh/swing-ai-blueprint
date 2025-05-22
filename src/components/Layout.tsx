
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

const LayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpenMobile(false);
  }, [location, setOpenMobile]);

  // Don't show back button on specific pages where we have custom headers
  const hideGlobalBackButton = ['/rounds', '/rounds/'].some(path => 
    location.pathname === path || location.pathname.startsWith('/rounds/')
  );

  const handleBackNavigation = () => {
    // Custom back navigation based on current route
    if (location.pathname === '/profile') {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 w-full min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4 py-4">
            <SidebarTrigger />
            {location.pathname !== "/" && !hideGlobalBackButton && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleBackNavigation}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Button>
            )}
          </div>
          <div className="w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
};

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
