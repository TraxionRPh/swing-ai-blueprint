
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface RoundDebugPanelProps {
  roundId?: string;
  currentHole?: number;
  holeCount?: number;
  isLoading?: boolean;
  resumeData?: {
    forceResume?: string | null;
    sessionHole?: string | null;
    localHole?: string | null;
  };
}

export const RoundDebugPanel = (props: RoundDebugPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  // Only show in development mode - not in production
  if (import.meta.env.PROD) {
    return null;
  }
  
  return (
    <Card className="mt-4 bg-muted/30 border-dashed">
      <CardHeader className="py-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm text-muted-foreground">Debug Info</CardTitle>
          <Badge variant="outline">{expanded ? "Hide" : "Show"}</Badge>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0 text-xs text-muted-foreground space-y-2">
          <div>
            <strong>Round ID:</strong> {props.roundId || "None"}
          </div>
          
          {props.currentHole !== undefined && (
            <div>
              <strong>Current Hole:</strong> {props.currentHole} / {props.holeCount || 18}
            </div>
          )}
          
          {props.isLoading !== undefined && (
            <div>
              <strong>Loading:</strong> {props.isLoading ? "Yes" : "No"}
            </div>
          )}
          
          {props.resumeData && (
            <div className="space-y-1">
              <div><strong>Force Resume:</strong> {props.resumeData.forceResume || "No"}</div>
              <div><strong>Session Hole:</strong> {props.resumeData.sessionHole || "None"}</div>
              <div><strong>Local Hole:</strong> {props.resumeData.localHole || "None"}</div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
