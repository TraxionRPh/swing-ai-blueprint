
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
        hideHeader={false} // We want to show the header, but only inside LoadingState
      />
    </div>
  );
};
