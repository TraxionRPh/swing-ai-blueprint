
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DiagnosisCardProps {
  diagnosis: string;
  rootCauses: string[];
  isAIGenerated?: boolean;
  problem?: string;
}

export const DiagnosisCard = ({ diagnosis, rootCauses, isAIGenerated, problem }: DiagnosisCardProps) => {
  // Check if this is a "topping the ball" problem and add specific info if needed
  const hasToppingDiagnosis = diagnosis && problem && 
    problem.toLowerCase().includes("topping") && 
    !diagnosis.toLowerCase().includes("topping the ball");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAIGenerated ? "AI Performance Analysis" : "Problem Analysis"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{diagnosis}</p>
        
        {hasToppingDiagnosis && (
          <div className="mt-6 p-3 bg-primary/5 rounded-md">
            <p className="font-medium text-primary mb-2">Topping the Ball Analysis:</p>
            <p className="text-muted-foreground">
              Topping the ball occurs when the club strikes the upper half of the ball, causing it to roll along the ground with little loft. 
              This is typically caused by coming out of your posture during the swing, having insufficient weight transfer, 
              or lifting your head/body too early during the downswing.
            </p>
          </div>
        )}
        
        <h3 className="font-medium mt-6 mb-2">Root Causes</h3>
        <ul className="list-disc pl-5 space-y-1">
          {rootCauses.map((cause, i) => (
            <li key={i} className="text-muted-foreground">{cause}</li>
          ))}
          {hasToppingDiagnosis && !rootCauses.some(cause => cause.toLowerCase().includes("topping")) && (
            <>
              <li className="text-muted-foreground">Rising up during the downswing</li>
              <li className="text-muted-foreground">Improper weight transfer toward the target</li>
              <li className="text-muted-foreground">Poor ball position in your stance</li>
            </>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};
