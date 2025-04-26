
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDifficultyBadgeClass } from "@/utils/challengeUtils";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
};

export type UserProgress = {
  challenge_id: string;
  best_score: string | null;
  recent_score: string | null;
};

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: UserProgress;
}

export const ChallengeCard = ({ challenge, progress }: ChallengeCardProps) => {
  const navigate = useNavigate();

  const handleStartChallenge = () => {
    navigate(`/challenge-tracking/${challenge.id}`);
  };

  const handleViewHistory = () => {
    navigate(`/challenge-history/${challenge.id}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{challenge.title}</CardTitle>
          <Badge className={getDifficultyBadgeClass(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
        </div>
        <CardDescription>Challenge Results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        <div className="space-y-2">
          {progress?.best_score && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Best Score:</span>
              <Badge variant="success" className="ml-2">{progress.best_score}</Badge>
            </div>
          )}
          {progress?.recent_score && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Recent Score:</span>
              <Badge variant="secondary" className="ml-2">{progress.recent_score}</Badge>
            </div>
          )}
          {!progress?.best_score && !progress?.recent_score && (
            <div className="text-sm text-muted-foreground">
              No attempts yet
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {challenge.metrics && challenge.metrics.map((metric: string) => (
            <Badge key={metric} variant="outline">{metric}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" size="sm" className="flex-1" onClick={handleStartChallenge}>
          Start Challenge
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleViewHistory}>
          View History
        </Button>
      </CardFooter>
    </Card>
  );
};
