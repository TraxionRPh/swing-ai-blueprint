
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
      <LoadingState 
        onBack={onBack} 
        message="Preparing round data..."
        retryFn={retryLoading}
        roundId={roundId || undefined}
        hideHeader={false} // Show header inside LoadingState only
      />
    </div>
  );
};
