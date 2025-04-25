
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SkillLevelStepProps {
  handicap: string;
  setHandicap: (value: string) => void;
}

const SkillLevelStep = ({ handicap, setHandicap }: SkillLevelStepProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-medium">What's your golf skill level?</h3>
      <RadioGroup value={handicap} onValueChange={setHandicap}>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="beginner" id="beginner" />
          <Label htmlFor="beginner">Beginner (36+ handicap)</Label>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="novice" id="novice" />
          <Label htmlFor="novice">Novice (25-36 handicap)</Label>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="intermediate" id="intermediate" />
          <Label htmlFor="intermediate">Intermediate (15-24 handicap)</Label>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="advanced" id="advanced" />
          <Label htmlFor="advanced">Advanced (5-14 handicap)</Label>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="expert" id="expert" />
          <Label htmlFor="expert">Expert (0-4 handicap)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pro" id="pro" />
          <Label htmlFor="pro">Professional (+ handicap)</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default SkillLevelStep;
