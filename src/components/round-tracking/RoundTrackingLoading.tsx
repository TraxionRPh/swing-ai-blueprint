
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";

interface RoundTrackingLoadingProps {
  onBack: () => void;
  roundId?: string | null;
  retryLoading: () => void;
}

export const RoundTrackingLoading = ({
  onBack,
  roundId,
  retryLoading
}: RoundTrackingLoadingProps) => {
  return (
    <div className="space-y-6">
      {/* Remove the RoundTrackingHeader since LoadingState includes it */}
      <LoadingState 
        onBack={onBack} 
        message="Preparing round data..."
        retryFn={retryLoading}
        roundId={roundId || undefined}
        hideHeader={false} // Set to false to show the header inside LoadingState
      />
    </div>
  );
};
