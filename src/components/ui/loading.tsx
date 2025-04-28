
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  message?: string;
  fixed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  minHeight?: string | number;
  error?: Error | string | null;
  onRetry?: () => void;
}

export function Loading({ 
  className, 
  message = "Loading...", 
  fixed = false,
  size = 'md',
  minHeight = "400px",
  error = null,
  onRetry
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  // Fix minHeight prop handling - directly use the value rather than trying to interpolate it
  const minHeightStyle = {
    minHeight: typeof minHeight === 'string' ? minHeight : `${minHeight}px`
  };

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div 
      className={cn(
        "flex w-full flex-col items-center justify-center",
        fixed && "fixed inset-0 bg-background/95 z-50",
        className
      )}
      style={minHeightStyle}
    >
      <div className="flex flex-col items-center justify-center">
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
        {message && (
          <p className="mt-4 text-sm text-muted-foreground text-center">{message}</p>
        )}
        {errorMessage && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
