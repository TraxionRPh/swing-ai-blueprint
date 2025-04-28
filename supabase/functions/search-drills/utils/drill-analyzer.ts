
/**
 * Helper module for analyzing and ranking drills in the search-drills function
 */

import { Drill } from '../types.ts';

/**
 * Extract ranked drill IDs from AI response text
 * @param text AI response text containing drill IDs
 * @returns Array of extracted drill IDs
 */
export function extractDrillIds(text: string): string[] {
  return text.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g) || [];
}

/**
 * Get recommended drills in order from the available drills and extracted IDs
 * @param drills Available drills
 * @param drillIds Extracted drill IDs
 * @returns Array of recommended drills
 */
export function getRecommendedDrills(drills: Drill[], drillIds: string[]): Drill[] {
  return drillIds
    .map(id => drills.find(d => d.id === id))
    .filter(Boolean) // Remove any undefined entries
    .slice(0, 5); // Limit to top 5 drills
}

/**
 * Generate AI prompt for selecting the best drills
 * @returns System prompt for OpenAI
 */
export function generateAISystemPrompt(): string {
  return `You are a professional golf coach assistant with deep expertise in analyzing golf swing mechanics and training methods. Your task is to carefully analyze the user's golf issue and select the top 3-5 most relevant drills that will directly address their specific problem.

Consider:
1. The exact technical cause of the issue described (e.g., for a hook: closed clubface, in-to-out swing path)
2. How each drill's focus, difficulty, and mechanics match the user's specific needs
3. A progression of drills that builds skills logically

Common golf swing issues and what to look for:
- Hook/Draw issues: Look for drills focused on grip, swing path, clubface control
- Slice/Fade issues: Look for drills about swing path, wrist position, shoulder alignment
- Topped/Fat shots: Look for drills on posture, ball position, weight transfer
- Distance problems: Look for drills on tempo, sequencing, core rotation
- Consistency issues: Look for fundamentals drills on setup, alignment
- Bunker issues: Look for drills specifically mentioning "bunker", "sand", or "explosion shot"

Look at drill titles, descriptions, focus areas, categories, and difficulty levels to make optimal matches.
Return ONLY the IDs of the best matching drills in order of relevance, with the most effective drill first.
Your response should ONLY contain UUIDs in the format: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" separated by commas or line breaks.`;
}

/**
 * Generate AI prompt for providing analysis text
 * @returns System prompt for OpenAI
 */
export function generateAnalysisPrompt(): string {
  return `You are a professional golf coach. Provide a concise explanation (120-150 words) of:
1. The likely root cause of the golfer's issue
2. Why the recommended drills will effectively address this issue
3. How to get the most out of these drills (key focus areas)

Be specific but accessible. Use technical terms but explain them clearly.`;
}
