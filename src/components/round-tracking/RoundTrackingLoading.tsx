
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { RefreshCcw } from "lucide-react";

interface RoundTrackingLoadingProps {
  onBack: () => void;
  roundId?: string | null;
  retryLoading: () => void;
  error?: string | null;
}

export const RoundTrackingLoading = ({
  onBack,
  roundId,
  retryLoading,
  error
}: RoundTrackingLoadingProps) => {
  // Create appropriate loading message
  const loadingMessage = roundId 
    ? `Loading round ${roundId.substring(0, 8)}...` 
    : "Loading rounds...";

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      <Card>
        <CardContent className="py-6 flex flex-col items-center justify-center min-h-[250px]">
          <Loading message={loadingMessage} minHeight={200} />
          
          {error && (
            <div className="mt-8 text-center">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={retryLoading}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
