
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Layout = () => {
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
