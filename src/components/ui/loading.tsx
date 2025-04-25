
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  message?: string;
}

export function Loading({ className, message = "Loading..." }: LoadingProps) {
  return (
    <div className={cn("flex min-h-[400px] flex-col items-center justify-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
