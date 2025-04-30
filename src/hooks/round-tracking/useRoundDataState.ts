
import { useState } from "react";

// Define an interface for round data by ID
interface RoundsByIdType {
  [key: string]: any; // Replace 'any' with a more specific type if available
}

export const useRoundDataState = () => {
  // Add state for storing rounds by ID
  const [roundsById, setRoundsById] = useState<RoundsByIdType>({});

  return {
    roundsById,
    setRoundsById
  };
};
