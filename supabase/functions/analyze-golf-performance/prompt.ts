
interface PromptParams {
  userId?: string;
  roundData?: any[];
  handicapLevel?: string;
  goals?: string[];
  specificProblem?: string;
  planDuration?: string;
  includeProgressChallenge?: boolean;
}

export function generatePrompt(params: PromptParams): string {
  const { userId, roundData, handicapLevel, goals = [], specificProblem, planDuration = "1" } = params;
  
  const problemContext = specificProblem 
    ? `The golfer has a specific problem: "${specificProblem}".`
    : "Analyze the golfer's performance and identify key areas for improvement.";
  
  const days = parseInt(planDuration) || 1;
  
  const prompt = `
    You are a PGA-certified golf coach with 15+ years of experience. You're creating a personalized practice plan for a golfer.
    
    ${problemContext}
    
    Based on this information, create a comprehensive ${days}-day practice plan that addresses this issue.
    
    Additional context:
    - Golfer's handicap level: ${handicapLevel || 'intermediate'}
    - Goals: ${goals.join(', ') || 'Improve overall performance'}
    - Round data: ${roundData && roundData.length > 0 ? JSON.stringify(roundData) : 'No recent rounds recorded'}
    
    Important: The practice plan MUST include a progress challenge at the beginning and end that helps the golfer measure improvement.
    
    Return the practice plan in the following JSON format:
    {
      "problem": "Brief description of the main problem",
      "diagnosis": "Detailed analysis of the problem and its causes",
      "rootCauses": ["Primary causes of the issue", "Secondary factors"],
      "recommendedDrills": [
        {
          "name": "Name of drill",
          "description": "Detailed description",
          "difficulty": "Beginner/Intermediate/Advanced",
          "duration": "15 minutes",
          "focus": ["Technical aspect", "Mental aspect"]
        }
      ],
      "practicePlan": {
        "duration": "${days} ${days > 1 ? 'days' : 'day'}",
        "frequency": "Daily/Weekly recommendation",
        "sessions": [
          {
            "focus": "Main focus of this session",
            "drills": ["Drill name 1", "Drill name 2"],
            "duration": "45 minutes"
          }
        ]
      },
      "progressChallenge": {
        "name": "Challenge name related to the problem",
        "description": "How this challenge measures improvement",
        "steps": [
          "Step 1 of the challenge",
          "Step 2 of the challenge",
          "Step 3 of the challenge"
        ]
      }
    }
    
    Ensure the plan is realistic, focused on addressing the specific problem, and includes clear instructions.
    The practice plan should include exactly ${days} sessions, one for each day.
    Each recommended drill should be specific and directly related to fixing the golfer's problem.
    The progress challenge should be a measurable way to track improvement from before starting the plan to after completing it.
  `;

  return prompt;
}
