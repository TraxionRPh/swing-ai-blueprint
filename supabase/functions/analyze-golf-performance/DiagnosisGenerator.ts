
import { ProblemCategory } from './golfCategorization.ts';

export class DiagnosisGenerator {
  private problem: string;
  private problemCategory: ProblemCategory | null;

  constructor(problem: string, problemCategory: ProblemCategory | null) {
    this.problem = problem.toLowerCase();
    this.problemCategory = problemCategory;
  }

  generateDiagnosis(): string {
    if (this.problem.includes('top') || this.problem.includes('topping')) {
      return `Analysis of your topping issues reveals that you're likely hitting the top half of the golf ball, causing low-trajectory shots that don't get airborne. This often happens when your weight shifts backward during the swing or when you lift your upper body (early extension) right before impact. The data suggests your swing arc is too shallow, with the lowest point of your swing occurring before you reach the ball. The inconsistent ball contact is significantly reducing your shot distance and accuracy, particularly with your irons.`;
    }
    
    if (this.problem.includes('chunk') || this.problem.includes('fat') || this.problem.includes('heavy')) {
      return `Analysis of your iron contact issues reveals inconsistent low point control in your swing. The data suggests you're likely hitting behind the ball frequently, causing "chunked" shots where the club contacts the ground before the ball. This is often a result of your weight distribution staying too far on the back foot through impact, as well as a swing path that may be too steep. Your tendency to "scoop" or flip at impact could also be contributing to these contact issues. Improving your iron strikes will significantly lower your scores by increasing both accuracy and distance control.`;
    }

    if (this.problem.includes('slice') || this.problem.includes('slicing')) {
      if (this.problem.includes('driver')) {
        return `Your driver slice is characterized by a ball flight that starts left (for right-handed golfers) and curves dramatically to the right, often landing in trouble. Analysis indicates this is caused by an outside-to-in swing path combined with an open clubface at impact. The data suggests you're likely starting your downswing with your upper body, creating an over-the-top move that cuts across the ball. Your grip positioning and alignment may also be contributing factors, potentially setting up conditions for the open face at impact.`;
      }
      return `Your slice is characterized by a ball flight that starts straight but curves significantly to the right (for right-handed golfers). This happens due to an outside-to-in swing path combined with an open clubface at impact. The data indicates your swing likely has a steeper angle of attack, cutting across the ball and creating excessive side spin. Your grip and alignment also appear to be contributing factors to this ball flight pattern.`;
    }

    if (this.problem.includes('hook') || this.problem.includes('hooking')) {
      return `Your hook shots are characterized by a ball flight that starts right (for right-handed golfers) and curves dramatically to the left, often resulting in lost distance and directional control. Analysis indicates this is likely caused by an inside-to-out swing path combined with a closed clubface at impact. Your grip may be too strong, and the data suggests you might be releasing the club too early in your downswing. This combination creates excessive right-to-left spin on the ball, leading to unpredictable shot patterns.`;
    }

    if (this.problem.includes('putt') || this.problem.includes('putting')) {
      return `Analysis of your putting stroke reveals inconsistencies in your tempo and path. The data suggests you may be struggling with distance control and direction. Your stroke appears to have subtle variations in pace and path that affect consistency. Additionally, your setup position shows some inconsistency in eye position relative to the ball and minor variations in your stance width, leading to inconsistent stroke patterns and missed putts.`;
    }

    if (this.problem.includes('chip') || this.problem.includes('pitch') || this.problem.includes('short game')) {
      return `Your chipping technique shows inconsistencies in contact quality and distance control. Data analysis indicates you may be using too much wrist action during your chipping stroke, creating inconsistent low point control. Your weight distribution appears to favor your back foot more than ideal for clean contact, and your clubface control through impact shows room for improvement, leading to inconsistent results around the green.`;
    }

    if (this.problem.includes('distance') || this.problem.includes('short') || this.problem.includes('long')) {
      return `Analysis of your distance control issues reveals inconsistencies in your swing tempo and contact quality. The data suggests you may be struggling with consistent strike location on the clubface, which is critical for distance control. Your swing speed shows variations between similar shots, and your low point control appears inconsistent. These factors combine to create unpredictable distances with your shots, making it difficult to plan your approach shots effectively.`;
    }
    
    return `Analysis of your ${this.problem} technique reveals several technical patterns that are affecting your consistency and performance. Your mechanics show room for improvement in areas of tempo, path, and position at key points in the swing. The data indicates specific focus areas that can help you achieve more consistent results.`;
  }

  generateRootCauses(): string[] {
    const category = this.problemCategory?.name.toLowerCase() || '';
    
    if (this.problem.includes('top') || this.problem.includes('topping')) {
      return [
        "Rising up during the downswing (early extension)",
        "Ball positioned too far back in stance",
        "Poor weight transfer with weight remaining on back foot",
        "Standing too close to the ball at address",
        "Upper body lifting through impact"
      ];
    }
    
    if (this.problem.includes('chunk') || this.problem.includes('fat') || this.problem.includes('heavy')) {
      return [
        "Improper weight transfer keeping weight on back foot at impact",
        "Early extension causing inconsistent low point control",
        "Steep angle of attack causing the club to dig too deep",
        "Scooping or flipping motion with the hands through impact",
        "Poor setup position with ball too far forward in stance"
      ];
    }
    
    if (this.problem.includes('slice') || this.problem.includes('slicing')) {
      return [
        "Outside-to-in swing path cutting across the ball",
        "Open clubface at impact relative to swing path",
        "Improper grip position allowing the face to open",
        "Over-rotation of the upper body in the backswing",
        "Starting the downswing with the shoulders instead of the lower body"
      ];
    }
    
    if (this.problem.includes('hook') || this.problem.includes('hooking')) {
      return [
        "Inside-to-out swing path",
        "Closed clubface at impact relative to swing path",
        "Overly strong grip position",
        "Early release of the club in the downswing",
        "Excessive forearm rotation through impact"
      ];
    }
    
    switch(category) {
      case "ball striking":
        return [
          "Improper weight transfer keeping weight on back foot at impact",
          "Early extension causing inconsistent low point control",
          "Steep angle of attack causing the club to dig too deep",
          "Scooping or flipping motion with the hands through impact",
          "Poor setup position with ball too far forward in stance"
        ];
      case "driving accuracy":
        return [
          "Outside-to-in swing path cutting across the ball",
          "Open clubface at impact relative to swing path",
          "Improper grip position allowing the face to open",
          "Over-rotation of the upper body in the backswing",
          "Starting the downswing with the shoulders instead of the lower body"
        ];
      case "putting":
        return [
          "Inconsistent stroke path leading to directional issues",
          "Variable tempo affecting distance control",
          "Inconsistent setup position and eye alignment",
          "Grip pressure changes during stroke",
          "Head movement during putting stroke"
        ];
      case "short game":
        return [
          "Excessive wrist action during chipping motion",
          "Inconsistent low point control",
          "Weight favoring back foot during stroke",
          "Variable ball position in stance",
          "Inconsistent clubface control through impact"
        ];
      default:
        return [
          "Technical inconsistencies in your fundamental mechanics",
          "Alignment and setup issues affecting your swing plane",
          "Tempo and timing variations leading to inconsistent contact",
          "Grip and pressure points that may be limiting your control",
          "Body rotation and sequencing issues affecting power and accuracy"
        ];
    }
  }
}

