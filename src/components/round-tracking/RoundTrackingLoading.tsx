
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
  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loading message={roundId 
            ? `Loading round data${roundId ? ` (${roundId.substring(0, 8)}...)` : ''}`
            : "Preparing round data..."} 
          />
          
          {error && (
            <div className="mt-8 text-center">
              <p className="text-sm text-red-500 mb-4">{error}</p>
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
