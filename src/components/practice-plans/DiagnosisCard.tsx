
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DiagnosisCardProps {
  diagnosis: string;
  rootCauses: string[];
}

export const DiagnosisCard = ({ diagnosis, rootCauses }: DiagnosisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Diagnosis</CardTitle>
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
