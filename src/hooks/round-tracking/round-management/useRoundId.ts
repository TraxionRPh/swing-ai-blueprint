
import { useState } from "react";

export const useRoundId = () => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  
  return {
    currentRoundId,
    setCurrentRoundId
  };
};
