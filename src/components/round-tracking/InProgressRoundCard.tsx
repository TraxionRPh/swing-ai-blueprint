
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";

interface InProgressRoundProps {
  roundId: string;
  courseName: string;
  lastHole: number;
  holeCount: number;
}

export const InProgressRoundCard = ({ roundId, courseName, lastHole, holeCount }: InProgressRoundProps) => {
  const navigate = useNavigate();

  const handleResumeRound = () => {
    navigate(`/rounds/${roundId}/${lastHole + 1}`);
  };

  return (
    <Card className="mb-6 bg-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Resume Round</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <p className="text-sm text-muted-foreground">
            You have an incomplete round at <span className="font-medium text-foreground">{courseName}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Progress: {lastHole} of {holeCount} holes completed
          </p>
          <Button onClick={handleResumeRound} className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" />
            Continue Round
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
