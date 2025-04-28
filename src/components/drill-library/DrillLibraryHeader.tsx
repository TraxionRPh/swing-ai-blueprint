
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const DrillLibraryHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-8 py-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
      </div>
    </div>
  );
};
