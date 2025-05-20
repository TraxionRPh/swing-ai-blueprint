
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RoundHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  hideBackButton?: boolean;
}

export const RoundHeader = ({
  title,
  subtitle,
  onBack,
  hideBackButton = false
}: RoundHeaderProps) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      {!hideBackButton && onBack && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
};
