
/**
 * Class responsible for generating golf swing diagnosis text based on user problems
 */
export class DiagnosisGenerator {
  private problem: string;
  private category: any;

  constructor(problem: string, category: any) {
    this.problem = problem || '';
    this.category = category;
  }

  /**
   * Generate a detailed diagnosis based on the user's specific problem
   */
  generateDiagnosis(): string {
    if (!this.problem) return "Not enough information to generate a diagnosis.";

    let diagnosis = "";
    const normalizedProblem = this.problem.toLowerCase();
    
    // Generate diagnosis based on problem category
    if (this.category) {
      switch(this.category.name) {
        case 'Driving':
          diagnosis = this.generateDrivingDiagnosis(normalizedProblem);
          break;
        case 'Iron Play':
          diagnosis = this.generateIronPlayDiagnosis(normalizedProblem);
          break;
        case 'Short Game':
          diagnosis = this.generateShortGameDiagnosis(normalizedProblem);
          break;
        case 'Putting':
          diagnosis = this.generatePuttingDiagnosis(normalizedProblem);
          break;
        default:
          diagnosis = this.generateGeneralDiagnosis(normalizedProblem);
      }
    } else {
      diagnosis = this.generateGeneralDiagnosis(normalizedProblem);
    }

    return diagnosis;
  }

  generateRootCauses(): string[] {
    if (!this.problem) return ["Insufficient information provided"];

    const normalizedProblem = this.problem.toLowerCase();
    const causes: string[] = [];

    // Generate specific root causes based on problem
    if (normalizedProblem.includes('slice')) {
      causes.push("Open clubface at impact");
      causes.push("Outside-to-in swing path");
    } else if (normalizedProblem.includes('hook')) {
      causes.push("Closed clubface at impact");
      causes.push("Inside-to-out swing path");
    } else if (normalizedProblem.includes('chunk') || normalizedProblem.includes('fat')) {
      causes.push("Swing bottoming out before the ball");
      causes.push("Improper weight transfer");
    } else if (normalizedProblem.includes('thin') || normalizedProblem.includes('top')) {
      causes.push("Lifting up during downswing");
      causes.push("Poor posture maintenance");
    } else if (normalizedProblem.includes('putt') || normalizedProblem.includes('green')) {
      causes.push("Inconsistent stroke path");
      causes.push("Improper pace control");
    }

    // Add generic causes if needed
    if (causes.length < 2) {
      causes.push("Inconsistent fundamentals");
      causes.push("Swing mechanics need refinement");
    }

    return causes;
  }

  // Helper methods for specific diagnosis sections
  private generateDrivingDiagnosis(problem: string): string {
    if (problem.includes('slice')) {
      return "Your slicing issue with the driver is typically caused by an open clubface at impact and an outside-to-in swing path. Focus on a more neutral grip and practice releasing the club properly through impact. The recommended drills will help you correct your swing path and improve clubface control.";
    } else if (problem.includes('hook')) {
      return "Your hooking tendency indicates a closed clubface at impact and possibly an inside-to-out swing path. Work on grip pressure and swing path. The selected drills will help you gain better control of your clubface and develop a more neutral swing path.";
    } else if (problem.includes('distance')) {
      return "To improve driving distance, you need to focus on increasing swing speed while maintaining proper sequencing. The selected drills will help you generate more power from the ground up and improve your swing efficiency for maximum distance.";
    } else {
      return "To improve your driving performance, it's important to focus on consistency in your setup and swing path. The recommended practice drills will help you develop a more repeatable swing and better control off the tee.";
    }
  }

  private generateIronPlayDiagnosis(problem: string): string {
    if (problem.includes('thin') || problem.includes('top')) {
      return "Hitting thin iron shots typically comes from lifting your upper body during the downswing or having the ball too far forward in your stance. Focus on maintaining your spine angle and proper ball position. The recommended drills will help you improve contact consistency.";
    } else if (problem.includes('fat') || problem.includes('chunk')) {
      return "Fat shots with your irons often result from poor weight transfer or casting the club too early. Work on shifting your weight properly and maintaining your wrist angles through impact. These drills will help you strike down and through the ball.";
    } else if (problem.includes('direction') || problem.includes('accuracy')) {
      return "Directional issues with iron shots typically stem from an inconsistent swing path or clubface angle at impact. The selected practice drills will focus on alignment, path control, and developing a more consistent ball flight pattern.";
    } else {
      return "To improve your iron play, focus on solid contact and consistent ball flight. The recommended practice regimen will help you develop better control of your irons through improved fundamentals and swing mechanics.";
    }
  }

  private generateShortGameDiagnosis(problem: string): string {
    if (problem.includes('chip') || problem.includes('pitch')) {
      return "Consistent short game success comes from solid fundamentals and touch. The selected drills will help you develop better distance control, proper weight distribution, and a consistent setup for your chipping and pitching.";
    } else if (problem.includes('bunker') || problem.includes('sand')) {
      return "Bunker play requires specific technique to effectively use the sand to lift the ball. Focus on opening the clubface, hitting the sand before the ball, and following through. These drills will build your confidence and consistency from sand.";
    } else {
      return "Your short game is critical for scoring. The recommended practice plan focuses on versatility around the greens with different clubs and situations. Regular practice of these drills will significantly lower your scores through improved up-and-down percentages.";
    }
  }

  private generatePuttingDiagnosis(problem: string): string {
    if (problem.includes('speed') || problem.includes('distance')) {
      return "Putting distance control is crucial for avoiding three-putts. The selected drills will help you develop better feel and consistency with your putting stroke to improve speed control on various length putts.";
    } else if (problem.includes('line') || problem.includes('direction')) {
      return "Directional control in putting comes from a square putter face at impact and a consistent stroke path. These practice drills focus on alignment, stroke path, and face control to help you start the ball on your intended line.";
    } else {
      return "A well-rounded putting practice regimen should address both line and speed. The recommended drills will help you develop a more consistent stroke, better green reading skills, and improved confidence on the greens.";
    }
  }

  private generateGeneralDiagnosis(problem: string): string {
    return "Based on your goals, a comprehensive approach to improvement is recommended. The selected practice plan focuses on the fundamental areas that will have the biggest impact on your overall game. Consistent practice using these drills will lead to more confidence and lower scores.";
  }
}
