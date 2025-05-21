
import { HoleNavigation } from "./HoleNavigation";
import { ParSelection } from "./ParSelection";

interface HoleHeaderProps {
  currentHole: number;
  holeCount: number;
  par: number;
  onParChange: (value: string) => void;
  goToPreviousHole: () => void;
}

export const HoleHeader = ({ 
  currentHole, 
  holeCount, 
  par, 
  onParChange, 
  goToPreviousHole 
}: HoleHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col space-y-2">
        <h3 className="font-medium">Hole {currentHole}</h3>
        <ParSelection par={par} onParChange={onParChange} />
      </div>
      <HoleNavigation 
        currentHole={currentHole} 
        holeCount={holeCount} 
        goToPreviousHole={goToPreviousHole} 
      />
    </div>
  );
};
