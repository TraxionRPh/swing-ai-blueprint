import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}
interface HoleScoreCardProps {
  holeData: HoleData;
  onUpdate: (data: HoleData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  teeColor?: string;
}
export const HoleScoreCard = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  teeColor
}: HoleScoreCardProps) => {
  const [data, setData] = useState(holeData);
  const handleChange = (field: keyof HoleData, value: any) => {
    const newData = {
      ...data,
      [field]: value
    };
    setData(newData);
    onUpdate(newData);
  };
  const getTeeColorStyle = () => {
    if (!teeColor) return 'bg-secondary';
    // Convert common tee color names to their CSS equivalents
    const colorMap: {
      [key: string]: string;
    } = {
      'blue': 'bg-blue-500',
      'white': 'bg-white text-black',
      'red': 'bg-red-500',
      'gold': 'bg-yellow-500',
      'black': 'bg-black',
      'green': 'bg-green-500'
    };
    return colorMap[teeColor.toLowerCase()] || 'bg-secondary';
  };
  return <Card className="w-full max-w-xl mx-auto">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Hole {data.holeNumber}</h3>
          
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="par">Par</Label>
            <Input id="par" type="number" placeholder="Enter par" value={data.par || ''} onChange={e => handleChange('par', parseInt(e.target.value) || 0)} min={3} max={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Yards</Label>
            <Input id="distance" type="number" placeholder="Enter yards" value={data.distance || ''} onChange={e => handleChange('distance', parseInt(e.target.value) || 0)} min={0} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score</Label>
            <Input id="score" type="number" placeholder="Enter score" value={data.score || ''} onChange={e => handleChange('score', parseInt(e.target.value) || 0)} min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="putts">Putts</Label>
            <Input id="putts" type="number" placeholder="Enter putts" value={data.putts || ''} onChange={e => handleChange('putts', parseInt(e.target.value) || 0)} min={0} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="fairway">Fairway Hit</Label>
            <Switch id="fairway" checked={data.fairwayHit} onCheckedChange={checked => handleChange('fairwayHit', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="gir">Green in Regulation</Label>
            <Switch id="gir" checked={data.greenInRegulation} onCheckedChange={checked => handleChange('greenInRegulation', checked)} />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            Previous Hole
          </Button>
          <Button onClick={onNext} disabled={isLast}>
            Next Hole
          </Button>
        </div>
      </CardContent>
    </Card>;
};