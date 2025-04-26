
// Prompt generation module
interface GolfData {
  userId: string;
  roundData: any;
  handicapLevel?: string;
  goals?: string;
  specificProblem?: string;
  planDuration?: string;
}

export function generatePrompt({
  handicapLevel,
  goals,
  specificProblem,
  roundData,
  planDuration = "1"
}: GolfData): string {
  const days = parseInt(planDuration) || 1;
  
  return `
    You are a professional golf coach and analyst. Based on the following data about a golfer,
    provide a detailed analysis of their performance, identify their strengths and weaknesses,
    and recommend specific practice drills.
    
    Player Data:
    - Handicap Level: ${handicapLevel || 'Not specified'}
    - Goals: ${goals || 'Improve overall game'}
    ${specificProblem ? `- Specific Problem: ${specificProblem}` : ''}
    - Plan Duration: ${days} ${days > 1 ? 'days' : 'day'}
    
    Recent Performance:
    ${JSON.stringify(roundData || {})}
    
    Format your response as JSON with the following structure:
    {
      "performanceAnalysis": {
        "driving": number (0-100),
        "ironPlay": number (0-100),
        "chipping": number (0-100),
        "bunker": number (0-100),
        "putting": number (0-100)
      },
      "aiConfidence": number (0-100),
      "identifiedIssues": [
        {
          "area": string,
          "description": string,
          "priority": "High" | "Medium" | "Low"
        }
      ],
      "recommendedPractice": {
        "weeklyFocus": string,
        "primaryDrill": {
          "name": string,
          "description": string,
          "frequency": string
        },
        "secondaryDrill": {
          "name": string,
          "description": string,
          "frequency": string
        },
        "weeklyAssignment": string
      }
    }
    
    ${specificProblem || days > 1 ? `
    Additionally, ${specificProblem ? `since the player mentioned a specific problem ("${specificProblem}")` : ''}${specificProblem && days > 1 ? ' and' : ''}${days > 1 ? ` needs a ${days}-day practice plan` : ''}, please provide a tailored practice plan in this format:
    {
      "problem": string,
      "diagnosis": string,
      "rootCauses": string[],
      "recommendedDrills": [
        {
          "name": string,
          "description": string,
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "duration": string,
          "focus": string[]
        }
      ],
      "practicePlan": {
        "duration": string,
        "frequency": string,
        "sessions": [
          {
            "focus": string,
            "drills": string[],
            "duration": string
          }
        ]
      }
    }
    
    IMPORTANT INSTRUCTIONS:
    1. If the golfer is a beginner (high handicap), focus more on fundamental drills.
    2. If the specific problem mentions "slicing driver", ensure your recommendations directly address swing path issues and face angle control.
    3. Create exactly ${days} sessions in the practice plan, one for each day.
    4. Make each session focused on a specific area with appropriate drill recommendations.
    5. If the golfer has limited performance data, make reasonable assumptions based on handicap level.
    ` : ''}
  `;
}
