
import { createContext } from "react";
import { RoundContextType } from "./types";

const RoundContext = createContext<RoundContextType | undefined>(undefined);

export default RoundContext;
