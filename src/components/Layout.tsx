
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpenMobile(false);
  }, [location, setOpenMobile]);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 w-full min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-4">
            <SidebarTrigger />
          </div>
          <div className="w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
