
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface DiagnosisCardProps {
  diagnosis: string;
  rootCauses: string[];
  isAIGenerated?: boolean;
  problem?: string;
}

export const DiagnosisCard = ({ diagnosis, rootCauses, isAIGenerated }: DiagnosisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAIGenerated ? "AI Performance Analysis" : "Problem Analysis"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{diagnosis}</p>
        
        <h3 className="font-medium mt-6 mb-2">Root Causes</h3>
        <ul className="list-disc pl-5 space-y-1">
          {rootCauses.map((cause, i) => (
            <li key={i} className="text-muted-foreground">{cause}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

