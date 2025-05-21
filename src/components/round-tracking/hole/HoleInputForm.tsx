
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { HoleData } from "@/types/round-tracking";

interface HoleInputFormProps {
  holeData: HoleData;
  handleDistanceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePuttsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (field: keyof HoleData, value: any) => void;
}

export const HoleInputForm = ({
  holeData,
  handleDistanceChange,
  handleScoreChange,
  handlePuttsChange,
  handleInputChange
}: HoleInputFormProps) => {
  return (
    <div className="space-y-4">
      {/* Yardage Input */}
      <div>
        <Label htmlFor="distance">Distance (yards)</Label>
        <Input
          id="distance"
          type="number"
          min="0"
          value={holeData.distance || ""}
          onChange={handleDistanceChange}
          className="mt-2"
          placeholder="Enter distance"
        />
      </div>
      
      {/* Score Input */}
      <div>
        <Label htmlFor="score">Score</Label>
        <Input
          id="score"
          type="number"
          min="1"
          value={holeData.score || ""}
          onChange={handleScoreChange}
          className="mt-2"
          placeholder="Enter score"
        />
      </div>
      
      {/* Putts Input */}
      <div>
        <Label htmlFor="putts">Putts</Label>
        <Input
          id="putts"
          type="number"
          min="0"
          value={holeData.putts || ""}
          onChange={handlePuttsChange}
          className="mt-2"
          placeholder="Enter putts"
        />
      </div>
      
      {/* Fairway and Green Regulation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="fairway"
            checked={holeData.fairwayHit}
            onCheckedChange={(checked) => handleInputChange('fairwayHit', checked)}
          />
          <Label htmlFor="fairway">Fairway Hit</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="gir"
            checked={holeData.greenInRegulation}
            onCheckedChange={(checked) => handleInputChange('greenInRegulation', checked)}
          />
          <Label htmlFor="gir">Green in Regulation</Label>
        </div>
      </div>
    </div>
  );
};
