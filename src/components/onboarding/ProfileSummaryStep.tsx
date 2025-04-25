
import { Separator } from "@/components/ui/separator";

interface ProfileSummaryStepProps {
  handicap: string;
  goals: string;
}

const ProfileSummaryStep = ({ handicap, goals }: ProfileSummaryStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium">Your SwingAI Profile</h3>
      <div className="space-y-2">
        <p className="font-medium">Skill Level:</p>
        <p className="text-muted-foreground capitalize">{handicap}</p>
      </div>
      <Separator />
      <div className="space-y-2">
        <p className="font-medium">Your Goals:</p>
        <p className="text-muted-foreground">{goals || "No specific goals provided"}</p>
      </div>
    </div>
  );
};

export default ProfileSummaryStep;
