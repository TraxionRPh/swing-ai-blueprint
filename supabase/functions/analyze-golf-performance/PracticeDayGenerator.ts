
/**
 * Class responsible for generating focus areas for practice days
 */
export class PracticeDayGenerator {
  private problem: string;
  private category: any;

  constructor(problem: string, category: any) {
    this.problem = problem;
    this.category = category;
  }

  /**
   * Get a focus area description for a specific day
   */
  getFocusByDay(dayIndex: number): string {
    // If no specific problem, return general focus areas
    if (!this.problem) {
      const generalFocus = [
        "Full Swing Fundamentals",
        "Short Game Technique",
        "Putting Practice",
        "Course Strategy",
        "Mental Game Development"
      ];
      return generalFocus[dayIndex % generalFocus.length];
    }

    const normalizedProblem = this.problem.toLowerCase();
    let focusAreas: string[] = [];

    // Generate focus areas based on problem category or problem content
    if (this.category) {
      switch (this.category.name) {
        case 'Driving':
          focusAreas = this.getDrivingFocusAreas(normalizedProblem);
          break;
        case 'Iron Play':
          focusAreas = this.getIronPlayFocusAreas(normalizedProblem);
          break;
        case 'Short Game':
          focusAreas = this.getShortGameFocusAreas(normalizedProblem);
          break;
        case 'Putting':
          focusAreas = this.getPuttingFocusAreas(normalizedProblem);
          break;
        default:
          focusAreas = this.determineAreasByProblemText(normalizedProblem);
      }
    } else {
      focusAreas = this.determineAreasByProblemText(normalizedProblem);
    }

    // Return the focus area for the specific day (cycling through if needed)
    return focusAreas[dayIndex % focusAreas.length];
  }
  
  // Determine focus areas by analyzing problem text directly
  private determineAreasByProblemText(problem: string): string[] {
    // Check for putting-related terms
    if (problem.includes('putt') || 
        problem.includes('green') || 
        problem.includes('lag') ||
        problem.includes('stroke')) {
      return this.getPuttingFocusAreas(problem);
    }
    
    // Check for driving-related terms
    if (problem.includes('driver') || 
        problem.includes('tee shot') || 
        problem.includes('slice') ||
        problem.includes('hook')) {
      return this.getDrivingFocusAreas(problem);
    }
    
    // Check for iron-related terms
    if (problem.includes('iron') || 
        problem.includes('approach') || 
        problem.includes('ball striking') ||
        problem.includes('contact')) {
      return this.getIronPlayFocusAreas(problem);
    }
    
    // Check for short game terms
    if (problem.includes('chip') || 
        problem.includes('pitch') || 
        problem.includes('short game')) {
      return this.getShortGameFocusAreas(problem);
    }
    
    // Check for bunker terms
    if (problem.includes('bunker') || problem.includes('sand')) {
      return this.getBunkerFocusAreas(problem);
    }
    
    // Default to general areas if no specific problem is identified
    return this.getGeneralFocusAreas();
  }

  // Helper methods to get focus areas for different categories
  private getDrivingFocusAreas(problem: string): string[] {
    if (problem.includes('slice')) {
      return [
        "Grip and Setup Correction", 
        "Clubface Control Drills",
        "Path Training", 
        "Full Swing Integration",
        "On-Course Application"
      ];
    } else if (problem.includes('hook')) {
      return [
        "Grip Pressure and Alignment", 
        "Swing Path Correction",
        "Release Pattern Training", 
        "Balanced Finishing Position",
        "Course Strategy with New Ball Flight"
      ];
    } else if (problem.includes('distance')) {
      return [
        "Flexibility and Rotation Drills", 
        "Sequencing for Power",
        "Speed Development", 
        "Solid Contact Focus",
        "Distance Control with New Power"
      ];
    } else {
      return [
        "Setup and Alignment", 
        "Rhythm and Tempo",
        "Consistent Contact", 
        "Shot Shaping",
        "Course Management"
      ];
    }
  }

  private getIronPlayFocusAreas(problem: string): string[] {
    if (problem.includes('thin') || problem.includes('top')) {
      return [
        "Ball Position and Setup", 
        "Weight Distribution",
        "Downward Strike Training", 
        "Divot Control",
        "Distance Control with Solid Contact"
      ];
    } else if (problem.includes('fat') || problem.includes('chunk')) {
      return [
        "Weight Transfer Practice", 
        "Hand Position at Impact",
        "Body Rotation Through Impact", 
        "Low Point Control",
        "Pressure-Based Impact Drills"
      ];
    } else {
      return [
        "Distance Control", 
        "Trajectory Control",
        "Directional Control", 
        "Specialized Lies",
        "On-Course Iron Strategy"
      ];
    }
  }

  private getShortGameFocusAreas(problem: string): string[] {
    if (problem.includes('chip')) {
      return [
        "Basic Chipping Technique", 
        "Club Selection Around Greens",
        "Landing Spot Control", 
        "Different Lies Practice",
        "Creative Shot Options"
      ];
    } else if (problem.includes('pitch')) {
      return [
        "Distance Control with Wedges", 
        "Trajectory Options",
        "Spin Control", 
        "Partial Swing Calibration",
        "Specialized Pitch Situations"
      ];
    } else if (problem.includes('bunker') || problem.includes('sand')) {
      return [
        "Basic Sand Technique", 
        "Depth Control in Sand",
        "Different Sand Conditions", 
        "Specialized Bunker Shots",
        "Pressure Bunker Practice"
      ];
    } else {
      return [
        "Around the Green Strategy", 
        "Shot Selection Training",
        "Short Game Scoring", 
        "Up and Down Practice",
        "Pressure Situation Simulation"
      ];
    }
  }

  private getBunkerFocusAreas(problem: string): string[] {
    if (problem.includes('fairway')) {
      return [
        "Fairway Bunker Setup", 
        "Clean Contact from Sand",
        "Club Selection in Fairway Bunkers", 
        "Distance Control from Sand",
        "Escape Strategy"
      ];
    } else {
      return [
        "Greenside Bunker Technique", 
        "Sand Wedge Fundamentals",
        "Explosion Shot Control", 
        "Varied Sand Conditions",
        "High vs Low Bunker Shots"
      ];
    }
  }

  private getPuttingFocusAreas(problem: string): string[] {
    if (problem.includes('speed') || problem.includes('distance')) {
      return [
        "Distance Control Fundamentals", 
        "Long Putt Technique",
        "Uphill/Downhill Adaptations", 
        "Lag Putting Strategy",
        "Speed Transitions"
      ];
    } else if (problem.includes('line') || problem.includes('direction')) {
      return [
        "Alignment Technique", 
        "Stroke Path Training",
        "Face Control at Impact", 
        "Green Reading Fundamentals",
        "Breaking Putt Practice"
      ];
    } else {
      return [
        "Putting Fundamentals", 
        "Short Putt Confidence",
        "Mid-Range Mastery", 
        "Long Distance Control",
        "Pressure Putting Practice"
      ];
    }
  }

  private getGeneralFocusAreas(): string[] {
    return [
      "Full Swing Fundamentals",
      "Iron Play and Approach Shots",
      "Short Game Technique",
      "Putting Precision",
      "Course Strategy and Management"
    ];
  }
}
