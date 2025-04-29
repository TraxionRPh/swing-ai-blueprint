
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";

interface RoundTrackingLoadingProps {
  onBack: () => void;
  roundId?: string | null;
  retryLoading: () => void;
  networkError?: boolean;
}

export const RoundTrackingLoading = ({
  onBack,
  roundId,
  retryLoading,
  networkError = false
}: RoundTrackingLoadingProps) => {
  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      <LoadingState 
        onBack={onBack} 
        message="Preparing round data..."
        retryFn={retryLoading}
        roundId={roundId || undefined}
        networkError={networkError}
      />
    </div>
  );
};
