
import { useContext, ReactNode } from "react";
import { useRoundState } from "./hooks/useRoundState";
import RoundContext from "./RoundContext";
import { RoundContextType, RoundProviderProps } from "./types";

export const RoundProvider = ({ children, initialRoundId }: RoundProviderProps) => {
  const roundState = useRoundState(initialRoundId);
  
  return <RoundContext.Provider value={roundState}>{children}</RoundContext.Provider>;
};

export const useRound = () => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRound must be used within a RoundProvider");
  }
  return context;
};
