
interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

interface ScoreSummaryProps {
  holeScores: HoleData[];
}

export const ScoreSummary = ({ holeScores }: ScoreSummaryProps) => {
  const totals = holeScores.reduce((acc, hole) => ({
    score: acc.score + (hole.score || 0),
    putts: acc.putts + (hole.putts || 0),
    fairways: acc.fairways + (hole.fairwayHit ? 1 : 0),
    greens: acc.greens + (hole.greenInRegulation ? 1 : 0),
  }), { score: 0, putts: 0, fairways: 0, greens: 0 });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-muted p-4 rounded-lg">
        <div className="text-2xl font-bold">{totals.score}</div>
        <div className="text-sm text-muted-foreground">Total Score</div>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <div className="text-2xl font-bold">{totals.putts}</div>
        <div className="text-sm text-muted-foreground">Total Putts</div>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <div className="text-2xl font-bold">{totals.fairways}</div>
        <div className="text-sm text-muted-foreground">Fairways Hit</div>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <div className="text-2xl font-bold">{totals.greens}</div>
        <div className="text-sm text-muted-foreground">Greens in Regulation</div>
      </div>
    </div>
  );
};
