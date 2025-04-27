
import { Info } from "lucide-react";

export const AIAnalysisInfoBanner = () => {
  return (
    <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3 text-sm border border-muted">
      <Info className="h-5 w-5 text-muted-foreground" />
      <p className="text-muted-foreground">
        AI analysis improves as you track more rounds and practice sessions.
      </p>
    </div>
  );
};
