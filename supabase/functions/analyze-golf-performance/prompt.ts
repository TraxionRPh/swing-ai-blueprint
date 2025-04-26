
// Prompt generation module
interface GolfData {
  userId: string;
  roundData: any;
  handicapLevel?: string;
  goals?: string;
  specificProblem?: string;
}

export function generatePrompt({
  handicapLevel,
  goals,
  specificProblem,
  roundData
}: GolfData): string {
  return `
    You are a professional golf coach and analyst. Based on the following data about a golfer,
    provide a detailed analysis of their performance, identify their strengths and weaknesses,
    and recommend specific practice drills.
    
    Player Data:
    - Handicap Level: ${handicapLevel || 'Not specified'}
    - Goals: ${goals || 'Improve overall game'}
    ${specificProblem ? `- Specific Problem: ${specificProblem}` : ''}
    
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
    
    ${specificProblem ? `
    Additionally, since the player mentioned a specific problem ("${specificProblem}"), please provide a tailored practice plan in this format:
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
    ` : ''}
  `;
}
