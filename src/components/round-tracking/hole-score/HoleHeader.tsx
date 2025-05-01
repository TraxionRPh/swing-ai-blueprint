
import React from "react";

interface HoleHeaderProps {
  holeNumber: number;
  par?: number;
  distance?: number;
}

export const HoleHeader = ({ holeNumber, par, distance }: HoleHeaderProps) => {
  console.log(`HoleHeader rendering hole ${holeNumber} with par ${par} and distance ${distance} yards`);
  
  return (
    <div className="flex justify-between items-center">
      <div className="text-2xl font-bold">Hole {holeNumber}</div>
      <div className="flex items-center space-x-3">
        {par !== undefined && (
          <span className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            Par {par}
          </span>
        )}
        {distance && distance > 0 && (
          <span className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {distance} yards
          </span>
        )}
      </div>
    </div>
  );
};
