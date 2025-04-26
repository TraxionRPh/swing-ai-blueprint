
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
        "flex min-h-[400px] flex-col items-center justify-center",
        fixed && "fixed inset-0 bg-background/95 z-50",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
