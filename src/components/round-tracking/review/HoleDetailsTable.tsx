
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { HoleData } from "@/types/round-tracking";

interface HoleDetailsTableProps {
  holeScores: HoleData[];
}

export const HoleDetailsTable = ({ holeScores }: HoleDetailsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hole by Hole Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hole</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Putts</TableHead>
              <TableHead className="hidden md:table-cell">Fairway</TableHead>
              <TableHead className="hidden md:table-cell">GIR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holeScores.map(hole => (
              <TableRow key={hole.holeNumber}>
                <TableCell>{hole.holeNumber}</TableCell>
                <TableCell>{hole.par}</TableCell>
                <TableCell className={
                  hole.score < hole.par ? "text-green-600 font-medium" : 
                  hole.score > hole.par ? "text-red-600 font-medium" : 
                  "font-medium"
                }>
                  {hole.score}
                </TableCell>
                <TableCell>{hole.putts}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {hole.par > 3 ? 
                    (hole.fairwayHit ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      "-") : 
                    "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {hole.greenInRegulation ? <CheckCircle className="h-4 w-4 text-green-500" /> : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {holeScores.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <p>No hole scores found for this round.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
