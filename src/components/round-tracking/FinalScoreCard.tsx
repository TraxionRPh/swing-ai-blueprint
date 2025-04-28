
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { HoleData } from "@/types/round-tracking";

interface FinalScoreCardProps {
  holeScores: HoleData[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  holeCount?: number;
}

export const FinalScoreCard = ({ 
  holeScores, 
  isOpen, 
  onConfirm, 
  onCancel, 
  holeCount = 18 
}: FinalScoreCardProps) => {
  const validHoleScores = holeScores.slice(0, holeCount);
  const frontNine = validHoleScores.slice(0, 9);
  const backNine = holeCount > 9 ? validHoleScores.slice(9, 18) : [];

  const calculateTotal = (holes: HoleData[]) => ({
    score: holes.reduce((sum, hole) => sum + (hole.score || 0), 0),
    putts: holes.reduce((sum, hole) => sum + (hole.putts || 0), 0),
    fairways: holes.filter(hole => hole.fairwayHit).length,
    greens: holes.filter(hole => hole.greenInRegulation).length,
    par: holes.reduce((sum, hole) => sum + (hole.par || 0), 0)
  });

  const frontNineTotals = calculateTotal(frontNine);
  const backNineTotals = holeCount > 9 ? calculateTotal(backNine) : { score: 0, putts: 0, fairways: 0, greens: 0, par: 0 };
  const totalScore = frontNineTotals.score + backNineTotals.score;
  const totalPar = frontNineTotals.par + backNineTotals.par;

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Round Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Hole</TableHead>
                {[...Array(9)].map((_, i) => (
                  <TableHead key={i + 1} className="text-center p-2">{i + 1}</TableHead>
                ))}
                <TableHead className="text-center p-2">Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Par</TableCell>
                {frontNine.map((hole, i) => (
                  <TableCell key={i} className="text-center p-2">{hole.par}</TableCell>
                ))}
                <TableCell className="text-center font-bold p-2">{frontNineTotals.par}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Score</TableCell>
                {frontNine.map((hole, i) => (
                  <TableCell key={i} className="text-center p-2">{hole.score || '-'}</TableCell>
                ))}
                <TableCell className="text-center font-bold p-2">{frontNineTotals.score}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {holeCount > 9 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Hole</TableHead>
                  {[...Array(9)].map((_, i) => (
                    <TableHead key={i + 10} className="text-center p-2">{i + 10}</TableHead>
                  ))}
                  <TableHead className="text-center p-2">In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Par</TableCell>
                  {backNine.map((hole, i) => (
                    <TableCell key={i} className="text-center p-2">{hole.par}</TableCell>
                  ))}
                  <TableCell className="text-center font-bold p-2">{backNineTotals.par}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Score</TableCell>
                  {backNine.map((hole, i) => (
                    <TableCell key={i} className="text-center p-2">{hole.score || '-'}</TableCell>
                  ))}
                  <TableCell className="text-center font-bold p-2">{backNineTotals.score}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-muted p-2 rounded-lg text-center">
              <div className="text-xl font-bold">{totalScore}</div>
              <div className="text-xs text-muted-foreground">Total Score</div>
            </div>
            <div className="bg-muted p-2 rounded-lg text-center">
              <div className="text-xl font-bold">{totalPar}</div>
              <div className="text-xs text-muted-foreground">Total Par</div>
            </div>
            <div className="bg-muted p-2 rounded-lg text-center">
              <div className="text-xl font-bold">{frontNineTotals.putts + backNineTotals.putts}</div>
              <div className="text-xs text-muted-foreground">Total Putts</div>
            </div>
            <div className="bg-muted p-2 rounded-lg text-center">
              <div className="text-xl font-bold">{frontNineTotals.fairways + backNineTotals.fairways}</div>
              <div className="text-xs text-muted-foreground">Fairways Hit</div>
            </div>
            <div className="bg-muted p-2 rounded-lg text-center">
              <div className="text-xl font-bold">{frontNineTotals.greens + backNineTotals.greens}</div>
              <div className="text-xs text-muted-foreground">Greens in Reg</div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>Back</Button>
          <Button onClick={onConfirm}>Submit Round</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
