
import React from "react";

interface HoleHeaderProps {
  holeNumber: number;
  par?: number;
  distance?: number;
}

export const HoleHeader = ({ holeNumber, par, distance }: HoleHeaderProps) => {
  // Add defensive checks to handle undefined values
  const safeHoleNumber = holeNumber || 1;
  const safePar = par || 0;
  const safeDistance = distance || 0;
  
  console.log(`HoleHeader rendering hole ${safeHoleNumber} with par ${safePar} and distance ${safeDistance} yards`);
  
  return (
    <div className="flex justify-between items-center">
      <div className="text-2xl font-bold">Hole {safeHoleNumber}</div>
      <div className="flex items-center space-x-3">
        {par !== undefined && par > 0 && (
          <span className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            Par {safePar}
          </span>
        )}
        {distance !== undefined && distance > 0 && (
          <span className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {safeDistance} yards
          </span>
        )}
      </div>
    </div>
  );
};
