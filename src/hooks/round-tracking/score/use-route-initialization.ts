
import { useEffect, useState } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  // Always return true states to prevent loading issues
  return { 
    isInitialized: true, 
    initialLoadAttempt: true 
  };
};
