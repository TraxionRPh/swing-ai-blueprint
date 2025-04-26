
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";

const LayoutContent = () => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpenMobile(false);
  }, [location, setOpenMobile]);

  return (
    <>
      <AppSidebar />
      <main className="flex-1 w-full min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-4">
            <SidebarTrigger />
          </div>
          <div className="w-full max-w-[1400px] mx-auto [&>div>h1]:text-center [&>div>p]:text-center [&>div>div>h1]:text-center [&>div>div>p]:text-center">
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
