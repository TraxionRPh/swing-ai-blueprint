
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Layout() {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Home");
  
  // Update page title based on the current route
  useEffect(() => {
    const path = location.pathname;
    let title = "Home";
    
    if (path.startsWith("/drills")) {
      title = "Drill Library";
    } else if (path.startsWith("/practice-plans")) {
      title = "Practice Plans";
    } else if (path.startsWith("/my-practice-plans")) {
      title = "My Practice Plans";
    } else if (path.startsWith("/profile")) {
      title = "Profile";
    } else if (path.startsWith("/challenges")) {
      title = "Challenges";
    } else if (path.startsWith("/ai-analysis")) {
      title = "AI Analysis";
    } else if (path.startsWith("/rounds")) {
      title = "Round Tracking";
    } else if (path.startsWith("/dashboard")) {
      title = "Dashboard";
    } else if (path.startsWith("/subscription")) {
      title = "Subscription";
    } else if (path.startsWith("/welcome")) {
      title = "Welcome";
    }
    
    setPageTitle(title);
  }, [location]);
  
  // Adjust styles when in round tracking mode to give more space
  const isRoundTracking = location.pathname.startsWith("/rounds/");
  const contentClass = cn(
    "flex flex-col flex-1 overflow-auto",
    isRoundTracking ? "p-0 sm:p-2" : "p-4 sm:p-6"
  );

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar pageTitle={pageTitle} />
      <main className={contentClass}>
        <div className="flex items-center mb-4 md:hidden">
          <SidebarTrigger className="mr-2" />
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
}
