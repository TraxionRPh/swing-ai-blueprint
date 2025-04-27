
/**
 * Class for generating personalized diagnosis messages for the user
 */
export class DiagnosisGenerator {
  private problem: string;
  private category: any;
  private handicapLevel: string | undefined;

  constructor(
    problem: string, 
    category: any, 
    handicapLevel?: string
  ) {
    this.problem = problem || '';
    this.category = category;
    this.handicapLevel = handicapLevel;
  }

  /**
   * Generate a detailed diagnosis for the user's golf problem
   * incorporating their skill level and performance data
   */
  generateDiagnosis(
    scoreGoal?: number, 
    performanceInsights?: any[]
  ): string {
    // If no specific problem, generate a generic diagnosis
    if (!this.problem) {
      return "Based on your profile and performance data, we've created a balanced practice plan that will help you improve your overall golf performance.";
    }

    const normalizedProblem = this.problem.toLowerCase();
    let diagnosis = '';

    // Handle skill level-specific advice
    const skillLevelIntro = this.getSkillLevelIntro();
    
    // Add introduction based on the skill level
    diagnosis += skillLevelIntro;
    
    // Add problem-specific analysis
    if (this.category) {
      switch (this.category.name) {
        case 'Driving':
          diagnosis += this.getDrivingDiagnosis(normalizedProblem);
          break;
        case 'Iron Play':
          diagnosis += this.getIronPlayDiagnosis(normalizedProblem);
          break;
        case 'Short Game':
          diagnosis += this.getShortGameDiagnosis(normalizedProblem);
          break;
        case 'Putting':
          diagnosis += this.getPuttingDiagnosis(normalizedProblem);
          break;
        default:
          diagnosis += this.getGeneralDiagnosis();
      }
    } else {
      diagnosis += this.getGeneralDiagnosis();
    }
    
    // Add information about performance insights if available
    if (performanceInsights && performanceInsights.length > 0) {
      diagnosis += "\n\nYour recent performance data shows: ";
      
      // Add high priority insights
      const highPriorityInsights = performanceInsights.filter(i => i.priority === "High");
      if (highPriorityInsights.length > 0) {
        diagnosis += "\n- Areas that need immediate attention: " + 
          highPriorityInsights.map(i => i.area).join(", ") + ".";
      }
      
      // Add medium priority insights
      const mediumPriorityInsights = performanceInsights.filter(i => i.priority === "Medium");
      if (mediumPriorityInsights.length > 0) {
        diagnosis += "\n- Areas where you're making progress but can improve further: " + 
          mediumPriorityInsights.map(i => i.area).join(", ") + ".";
      }
      
      // Add strengths
      const lowPriorityInsights = performanceInsights.filter(i => i.priority === "Low");
      if (lowPriorityInsights.length > 0) {
        diagnosis += "\n- Your strengths: " + 
          lowPriorityInsights.map(i => i.area).join(", ") + ".";
      }
    }

    // Add score goal-oriented advice if available
    if (scoreGoal) {
      diagnosis += `\n\nWith your goal score of ${scoreGoal} in mind, this practice plan focuses on the key skills and techniques that will help you consistently reach that target. Regular practice with these drills will build the muscle memory and confidence needed to see improvements in your actual rounds.`;
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
    // If there are high priority performance insights, use them as root causes
    if (performanceInsights && performanceInsights.length > 0) {
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
              "Outside-to-in swing path causing side spin",
              "Open clubface at impact",
              "Improper grip position",
              "Poor alignment at address"
            ];
          } else if (normalizedProblem.includes('hook')) {
            return [
              "Inside-to-out swing path causing side spin",
              "Closed clubface at impact",
              "Overly strong grip position",
              "Early release of the hands"
            ];
          } else if (normalizedProblem.includes('distance')) {
            return [
              "Insufficient club head speed",
              "Poor weight transfer during swing",
              "Inefficient use of body rotation",
              "Suboptimal launch conditions"
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
              "Low point of swing occurring before the ball",
              "Rising up during the downswing",
              "Poor posture at address",
              "Improper weight distribution"
            ];
          } else if (normalizedProblem.includes('fat') || normalizedProblem.includes('chunk')) {
            return [
              "Excessive forward shaft lean at impact",
              "Early release of the club",
              "Improper weight shift",
              "Dipping of the lead shoulder"
            ];
          } else {
            return [
              "Inconsistent ball positioning",
              "Variable swing tempo",
              "Poor contact with the ground",
              "Inconsistent distance control"
            ];
          }
          
        case 'Short Game':
          if (normalizedProblem.includes('chip')) {
            return [
              "Excessive wrist action during chipping",
              "Inconsistent ball position",
              "Poor club selection around greens",
              "Deceleration through impact"
            ];
          } else if (normalizedProblem.includes('pitch')) {
            return [
              "Inconsistent ball contact with pitch shots",
              "Improper weight distribution",
              "Inconsistent follow-through",
              "Poor distance control"
            ];
          } else if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
            return [
              "Hitting too close to the ball in sand",
              "Insufficient follow-through in bunker shots",
              "Improper clubface position at address",
              "Tension during bunker shots"
            ];
          } else {
            return [
              "Inconsistent short game technique",
              "Shot selection around greens",
              "Lack of practice with various short game shots",
              "Mental approach to recovery shots"
            ];
          }
          
        case 'Putting':
          if (normalizedProblem.includes('speed') || normalizedProblem.includes('distance')) {
            return [
              "Inconsistent putting stroke length",
              "Variable tempo on longer putts",
              "Poor distance perception",
              "Lack of practice with speed control"
            ];
          } else if (normalizedProblem.includes('line') || normalizedProblem.includes('direction')) {
            return [
              "Misaligned putter face at address",
              "Inconsistent eye position",
              "Path deviations during stroke",
              "Difficulty reading subtle breaks"
            ];
          } else {
            return [
              "Inconsistent putting fundamentals",
              "Grip pressure variations",
              "Visual alignment challenges",
              "Mental approach on the greens"
            ];
          }
          
        default:
          return [
            "Multiple areas needing improvement",
            "Inconsistent practice habits",
            "Lack of structured approach to improvement",
            "Balance between technical and on-course practice"
          ];
      }
    } else {
      return [
        "Multiple areas needing improvement",
        "Inconsistent practice habits",
        "Lack of structured approach to improvement",
        "Balance between technical and on-course practice"
      ];
    }
  }
}
