
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
      <main className="flex-1 p-4 lg:p-6">
        <div className="mb-4">
          <SidebarTrigger />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
