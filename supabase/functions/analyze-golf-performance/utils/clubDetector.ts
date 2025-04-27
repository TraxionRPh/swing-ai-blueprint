
/**
 * Detects which club type the golfer is having issues with
 * based on their problem description
 */
export function detectClubType(problem: string): string | null {
  const lowerProblem = problem.toLowerCase();
  
  if (lowerProblem.includes("driver") || 
      lowerProblem.includes("tee shot") || 
      lowerProblem.includes("off the tee")) {
    return "driver";
  }
  
  if (lowerProblem.includes("iron") || 
      lowerProblem.includes("7 iron") || 
      lowerProblem.includes("6 iron") ||
      lowerProblem.includes("5 iron")) {
    return "irons";
  }
  
  if (lowerProblem.includes("wedge") || 
      lowerProblem.includes("sand wedge") || 
      lowerProblem.includes("pitch")) {
    return "wedges";
  }
  
  if (lowerProblem.includes("putt") || 
      lowerProblem.includes("green") || 
      lowerProblem.includes("putter")) {
    return "putter";
  }
  
  // Default cases based on common issues
  if (lowerProblem.includes("slice") || 
      lowerProblem.includes("hook") ||
      lowerProblem.includes("draw") ||
      lowerProblem.includes("fade")) {
    return "driver"; // Most common with driver
  }
  
  if (lowerProblem.includes("chunk") || 
      lowerProblem.includes("fat") ||
      lowerProblem.includes("thin") ||
      lowerProblem.includes("top") ||
      lowerProblem.includes("topping") ||
      lowerProblem.includes("contact")) {
    return "irons"; // Most common with irons
  }
  
  return null;
}
