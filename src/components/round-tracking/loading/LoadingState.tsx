
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode } from "react";

interface LoadingStateProps {
  onBack: () => void;
  children?: ReactNode;
  hideHeader?: boolean;
}

export const LoadingState = ({ onBack, children, hideHeader = false }: LoadingStateProps) => {
  return (
    <div className="space-y-6 w-full">
      {!hideHeader && (
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBack}
            className="text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        </div>
      )}
      
      <div className="w-full flex justify-center">
        <Loading message="Loading round data..." />
      </div>
      
      {children}
    </div>
  );
};
