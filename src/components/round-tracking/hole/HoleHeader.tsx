
import React from 'react';
import { HoleNavigation } from './HoleNavigation';
import { ParSelection } from './ParSelection';

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
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Hole {currentHole}</h3>
        <HoleNavigation 
          currentHole={currentHole} 
          holeCount={holeCount} 
          goToPreviousHole={goToPreviousHole} 
        />
      </div>
      
      <div>
        <p className="text-sm mb-2">Par</p>
        <ParSelection 
          value={par.toString()} 
          onChange={onParChange} 
        />
      </div>
    </div>
  );
};
