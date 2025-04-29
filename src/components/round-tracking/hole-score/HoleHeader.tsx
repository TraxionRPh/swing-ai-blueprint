
import React from "react";

interface HoleHeaderProps {
  holeNumber: number;
}

export const HoleHeader = ({ holeNumber }: HoleHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-2xl font-bold">Hole {holeNumber}</h3>
    </div>
  );
};
