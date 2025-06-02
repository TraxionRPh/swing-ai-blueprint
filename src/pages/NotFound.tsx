
import { useEffect } from "react";
import { useLocation, Link } from "react-router-native";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Route not found:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">404</h1>
          <p className="text-xl text-gray-600 mb-2">Page Not Found</p>
          <p className="text-gray-500 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
