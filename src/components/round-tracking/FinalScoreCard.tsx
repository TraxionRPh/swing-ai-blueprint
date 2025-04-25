
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { HoleData } from "@/types/round-tracking";

interface FinalScoreCardProps {
  holeScores: HoleData[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FinalScoreCard = ({ holeScores, isOpen, onConfirm, onCancel }: FinalScoreCardProps) => {
  const frontNine = holeScores.slice(0, 9);
  const backNine = holeScores.slice(9, 18);

  const calculateTotal = (holes: HoleData[]) => ({
    score: holes.reduce((sum, hole) => sum + (hole.score || 0), 0),
    putts: holes.reduce((sum, hole) => sum + (hole.putts || 0), 0),
    fairways: holes.filter(hole => hole.fairwayHit).length,
    greens: holes.filter(hole => hole.greenInRegulation).length
  });

  const frontNineTotals = calculateTotal(frontNine);
  const backNineTotals = calculateTotal(backNine);
  const totalScore = frontNineTotals.score + backNineTotals.score;

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Round Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hole</TableHead>
                {[...Array(9)].map((_, i) => (
                  <TableHead key={i + 1} className="text-center">{i + 1}</TableHead>
                ))}
                <TableHead className="text-center">Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Score</TableCell>
                {frontNine.map((hole, i) => (
                  <TableCell key={i} className="text-center">{hole.score || '-'}</TableCell>
                ))}
                <TableCell className="text-center font-bold">{frontNineTotals.score}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hole</TableHead>
                {[...Array(9)].map((_, i) => (
                  <TableHead key={i + 10} className="text-center">{i + 10}</TableHead>
                ))}
                <TableHead className="text-center">In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Score</TableCell>
                {backNine.map((hole, i) => (
                  <TableCell key={i} className="text-center">{hole.score || '-'}</TableCell>
                ))}
                <TableCell className="text-center font-bold">{backNineTotals.score}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{totalScore}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{frontNineTotals.putts + backNineTotals.putts}</div>
              <div className="text-sm text-muted-foreground">Total Putts</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{frontNineTotals.fairways + backNineTotals.fairways}</div>
              <div className="text-sm text-muted-foreground">Fairways Hit</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{frontNineTotals.greens + backNineTotals.greens}</div>
              <div className="text-sm text-muted-foreground">Greens in Regulation</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Back</Button>
          <Button onClick={onConfirm}>Submit Round</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
