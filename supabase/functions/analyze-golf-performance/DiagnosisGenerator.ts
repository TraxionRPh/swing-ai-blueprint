
/**
 * Class for generating personalized diagnosis messages for the user
 */
export class DiagnosisGenerator {
  private problem: string;
  private category: any;
  private handicapLevel: string | undefined;
  private isAIGenerated: boolean;

  constructor(
    problem: string, 
    category: any, 
    handicapLevel?: string,
    isAIGenerated: boolean = false
  ) {
    this.problem = problem || '';
    this.category = category;
    this.handicapLevel = handicapLevel;
    this.isAIGenerated = isAIGenerated;
  }

  /**
   * Generate a detailed diagnosis for the user's golf problem
   * incorporating their skill level and performance data
   */
  generateDiagnosis(
    scoreGoal?: number, 
    performanceInsights?: any[]
  ): string {
    if (this.isAIGenerated) {
      return this.generateAIBasedDiagnosis(scoreGoal, performanceInsights);
    } else {
      return this.generateProblemBasedDiagnosis();
    }
  }

  private generateAIBasedDiagnosis(scoreGoal?: number, performanceInsights?: any[]): string {
    let diagnosis = '';

    // Add skill level context
    diagnosis += this.getSkillLevelIntro();

    // Add performance data analysis
    if (performanceInsights && performanceInsights.length > 0) {
      const highPriorityIssues = performanceInsights.filter(i => i.priority === "High");
      const mediumPriorityIssues = performanceInsights.filter(i => i.priority === "Medium");
      const strengths = performanceInsights.filter(i => i.priority === "Low");

      if (highPriorityIssues.length > 0) {
        diagnosis += "\n\nBased on your recent performance data, we've identified these key areas that need immediate attention:\n";
        highPriorityIssues.forEach(issue => {
          diagnosis += `- ${issue.description}\n`;
        });
      }

      if (mediumPriorityIssues.length > 0) {
        diagnosis += "\nAreas where you're making progress but can improve further:\n";
        mediumPriorityIssues.forEach(issue => {
          diagnosis += `- ${issue.description}\n`;
        });
      }

      if (strengths.length > 0) {
        diagnosis += "\nYour current strengths:\n";
        strengths.forEach(strength => {
          diagnosis += `- ${strength.description}\n`;
        });
      }
    }

    // Add score goal context if available
    if (scoreGoal) {
      diagnosis += `\nWith your target score of ${scoreGoal}, this practice plan focuses on the key areas that will help you achieve this goal consistently. `;
      diagnosis += `The drills and exercises are specifically selected to address your current performance patterns and bridge the gap to your target score.`;
    }

    return diagnosis;
  }

  private generateProblemBasedDiagnosis(): string {
    let diagnosis = this.getSkillLevelIntro();
    
    // Add problem-specific analysis based on category
    if (this.category) {
      switch (this.category.name) {
        case 'Driving':
          diagnosis += this.getDrivingDiagnosis(this.problem.toLowerCase());
          break;
        case 'Iron Play':
          diagnosis += this.getIronPlayDiagnosis(this.problem.toLowerCase());
          break;
        case 'Short Game':
          diagnosis += this.getShortGameDiagnosis(this.problem.toLowerCase());
          break;
        case 'Putting':
          diagnosis += this.getPuttingDiagnosis(this.problem.toLowerCase());
          break;
        default:
          diagnosis += this.getGeneralDiagnosis();
      }
    }

    return diagnosis;
  }

  /**
   * Get introduction text based on the skill level
   */
  private getSkillLevelIntro(): string {
    if (!this.handicapLevel) {
      return "After analyzing your golf performance, ";
    }
    
    switch(this.handicapLevel.toLowerCase()) {
      case 'beginner':
        return "As a beginner golfer, your focus should be on building fundamental skills and consistency. ";
      case 'novice':
        return "As a novice golfer, you're starting to develop your golf skills but still need to solidify the basics. ";
      case 'intermediate':
        return "As an intermediate golfer, you have decent fundamentals but need to refine your technique and consistency. ";
      case 'advanced':
        return "As an advanced golfer, you have good overall skills but need targeted practice to improve specific aspects of your game. ";
      case 'expert':
        return "As an expert golfer, you have excellent skills but need specialized practice to fine-tune your performance and gain those crucial extra yards or accuracy. ";
      case 'pro':
        return "At your professional level, the focus should be on optimizing every aspect of your game and making minor adjustments for maximum performance. ";
      default:
        return "After analyzing your golf performance, ";
    }
  }

  private getDrivingDiagnosis(problem: string): string {
    if (problem.includes('slice')) {
      return "Your driving issue is a slice, which is typically caused by an outside-to-in swing path and/or an open clubface at impact. This creates side spin that makes the ball curve to the right (for right-handed golfers). Your practice plan focuses on fixing your grip, alignment, and swing path to promote a straighter ball flight or even a slight draw.";
    } else if (problem.includes('hook')) {
      return "Your driving issue is a hook, which is typically caused by an inside-to-out swing path and/or a closed clubface at impact. This creates side spin that makes the ball curve dramatically to the left (for right-handed golfers). Your practice plan focuses on adjusting your grip, improving your swing path, and controlling the clubface through impact.";
    } else if (problem.includes('distance')) {
      return "Your driving issue is related to distance. Generating more distance requires a combination of club head speed, solid contact, and optimal launch conditions. Your practice plan focuses on improving your swing mechanics, flexibility, and timing to help you generate more power while maintaining control.";
    } else {
      return "Your driving issue requires attention to the fundamentals: grip, stance, alignment, and swing path. By focusing on these elements, you'll develop more consistency off the tee, resulting in better accuracy and distance.";
    }
  }

  private getIronPlayDiagnosis(problem: string): string {
    if (problem.includes('thin') || problem.includes('top')) {
      return "You're struggling with thin shots or topping the ball with your irons. This typically happens when the low point of your swing is before the ball or when you're lifting up during the downswing. Your practice plan focuses on improving your posture, balance, and downward strike to make solid contact with the ball.";
    } else if (problem.includes('fat') || problem.includes('chunk')) {
      return "You're struggling with fat or chunked iron shots, where you hit the ground before the ball. This is typically caused by improper weight transfer, early release, or poor posture. Your practice plan focuses on improving your weight shift, maintaining your spine angle, and controlling the low point of your swing.";
    } else {
      return "Your iron play issues are affecting your approach shots and scoring opportunities. Consistent iron play requires good ball position, proper weight transfer, and a descending blow. Your practice plan addresses these fundamentals to help you make solid contact and control your distances better.";
    }
  }

  private getShortGameDiagnosis(problem: string): string {
    if (problem.includes('chip')) {
      return "Your chipping issues are affecting your ability to get up and down around the green. Effective chipping requires proper club selection, a stable lower body, and good contact. Your practice plan focuses on these elements to help you develop touch and control with your chip shots.";
    } else if (problem.includes('pitch')) {
      return "Your pitching needs improvement to handle various distances and situations around the green. Good pitching technique involves proper weight distribution, wrist hinge, and follow-through. Your practice plan addresses these aspects to help you control distance and trajectory with your pitch shots.";
    } else if (problem.includes('bunker') || problem.includes('sand')) {
      return "Your bunker play is causing challenges in sand situations. Effective bunker play requires a different technique than regular shots - opening the clubface, hitting behind the ball, and following through. Your practice plan focuses on these specialized techniques to help you escape bunkers consistently.";
    } else {
      return "Your short game issues are affecting your scoring ability. The short game requires touch, feel, and specialized techniques for different situations. Your practice plan focuses on developing these skills to help you save strokes around the green.";
    }
  }

  private getPuttingDiagnosis(problem: string): string {
    if (problem.includes('speed') || problem.includes('distance')) {
      return "Your putting distance control needs improvement. Good lag putting requires proper tempo, feel, and visualization. Your practice plan focuses on these elements to help you develop better distance control and reduce three-putts.";
    } else if (problem.includes('line') || problem.includes('direction')) {
      return "Your putting alignment and direction need work. Accurate putting requires proper face alignment, a square stroke path, and good green reading. Your practice plan addresses these aspects to help you start the ball on your intended line more consistently.";
    } else {
      return "Your putting issues are affecting your scoring ability. Good putting combines proper technique, green reading, and mental approach. Your practice plan focuses on these elements to help you develop more consistency on the greens and lower your scores.";
    }
  }

  private getGeneralDiagnosis(): string {
    return "Your overall golf game will benefit from a balanced practice approach. This practice plan includes a mix of full swing, short game, and putting drills to help you develop a well-rounded skill set and improve your scores.";
  }

  /**
   * Generate root causes of the user's golf problem with
   * insights from their performance data
   */
  generateRootCauses(performanceInsights?: any[]): string[] {
    // If this is AI-generated and there are high priority performance insights, use them as root causes
    if (this.isAIGenerated && performanceInsights && performanceInsights.length > 0) {
      const highPriorityInsights = performanceInsights.filter(i => i.priority === "High");
      if (highPriorityInsights.length > 0) {
        return highPriorityInsights.map(i => i.description);
      }
    }

    if (!this.problem) {
      return ["General golf improvement needed", "Consistency across all areas of the game"];
    }

    const normalizedProblem = this.problem.toLowerCase();
    
    if (this.category) {
      switch (this.category.name) {
        case 'Driving':
          if (normalizedProblem.includes('slice')) {
            return [
              "Inconsistent swing path with driver",
              "Improper clubface position at impact",
              "Grip and alignment issues off the tee",
              "Setup position leading to path issues"
            ];
          } else if (normalizedProblem.includes('hook')) {
            return [
              "Inside-to-out swing path issues",
              "Clubface rotation through impact",
              "Grip position concerns",
              "Timing issues in the swing sequence"
            ];
          } else if (normalizedProblem.includes('distance')) {
            return [
              "Limited club head speed",
              "Inefficient energy transfer in swing",
              "Restricted body rotation",
              "Launch angle and spin rate optimization"
            ];
          } else {
            return [
              "Inconsistent driving mechanics",
              "Alignment and setup issues",
              "Ball position inconsistency",
              "Tension during the swing"
            ];
          }
        
        case 'Iron Play':
          if (normalizedProblem.includes('thin') || normalizedProblem.includes('top')) {
            return [
              "Low point control issues",
              "Early extension in downswing",
              "Posture and balance concerns",
              "Weight distribution patterns"
            ];
          } else if (normalizedProblem.includes('fat') || normalizedProblem.includes('chunk')) {
            return [
              "Excessive forward shaft lean",
              "Early release pattern",
              "Weight shift timing",
              "Upper body movement issues"
            ];
          } else {
            return [
              "Inconsistent ball positioning",
              "Variable swing tempo",
              "Ground interaction patterns",
              "Distance control variability"
            ];
          }
          
        case 'Short Game':
          if (normalizedProblem.includes('chip')) {
            return [
              "Excessive wrist action in short game",
              "Ball position consistency",
              "Club selection around greens",
              "Acceleration issues through impact"
            ];
          } else if (normalizedProblem.includes('pitch')) {
            return [
              "Inconsistent ball contact",
              "Weight distribution patterns",
              "Follow-through consistency",
              "Distance control variability"
            ];
          } else if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
            return [
              "Entry point issues in sand",
              "Follow-through length in bunkers",
              "Clubface position at address",
              "Tension during bunker shots"
            ];
          } else {
            return [
              "Short game technique inconsistencies",
              "Shot selection around greens",
              "Practice routine effectiveness",
              "Mental approach to recovery shots"
            ];
          }
          
        case 'Putting':
          if (normalizedProblem.includes('speed') || normalizedProblem.includes('distance')) {
            return [
              "Putting stroke length consistency",
              "Tempo variations on longer putts",
              "Distance perception issues",
              "Speed control practice inefficiency"
            ];
          } else if (normalizedProblem.includes('line') || normalizedProblem.includes('direction')) {
            return [
              "Face alignment issues at address",
              "Eye position inconsistency",
              "Stroke path variations",
              "Green reading challenges"
            ];
          } else {
            return [
              "Putting fundamental inconsistencies",
              "Grip pressure variations",
              "Visual alignment challenges",
              "Mental approach on greens"
            ];
          }
          
        default:
          return [
            "Multiple skill areas needing improvement",
            "Practice routine inefficiency",
            "Inconsistent performance patterns",
            "Technical and on-course practice balance"
          ];
      }
    } else {
      return [
        "Multiple skill areas needing improvement",
        "Practice routine inefficiency",
        "Inconsistent performance patterns", 
        "Technical and on-course practice balance"
      ];
    }
  }
}
