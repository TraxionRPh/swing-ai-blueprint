
import { ProblemCategory } from './golfCategorization.ts';

export class PracticeDayGenerator {
  private problem: string;
  private problemCategory: ProblemCategory | null;

  constructor(problem: string, problemCategory: ProblemCategory | null) {
    this.problem = problem;
    this.problemCategory = problemCategory;
  }

  getFocusByDay(dayIndex: number): string {
    const category = this.problemCategory?.name.toLowerCase() || '';
    
    if (category === "ball striking") {
      const focuses = [
        "Ball Position and Setup",
        "Weight Transfer and Low Point Control",
        "Impact Position and Follow Through",
        "Full Swing Integration"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    if (category === "driving accuracy") {
      const focuses = [
        "Grip and Setup Correction",
        "Swing Path Training",
        "Impact Position and Release",
        "Full Swing Integration"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    if (category === "putting") {
      const focuses = [
        "Stroke Path and Face Control",
        "Distance Control Training",
        "Reading Greens and Alignment",
        "Pressure Putting Practice"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    if (category === "short game") {
      const focuses = [
        "Basic Chipping Technique",
        "Distance Control Around Greens",
        "Different Lies and Situations",
        "Short Game Scoring Drills"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    const defaultFocuses = [
      "Fundamental Mechanics",
      "Technical Refinement",
      "Performance Training",
      "Integration and Testing"
    ];
    
    return defaultFocuses[dayIndex % defaultFocuses.length];
  }
}

