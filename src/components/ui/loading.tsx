
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  message?: string;
  fixed?: boolean;
}

export function Loading({ className, message = "Loading...", fixed = false }: LoadingProps) {
  return (
    <div 
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center relative",
        fixed && "fixed inset-0 bg-background/95 z-50",
        className
      )}
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground text-center">{message}</p>
      </div>
    </div>
  );
}
