/**
 * Helper module for analyzing and ranking drills in the search-drills function
 */

import type { Drill } from "../types.ts";

/**
 * Extract ranked drill IDs from AI response text
 * @param text AI response text containing drill IDs
 * @returns Array of extracted drill IDs
 */
export function extractDrillIds(text: string): string[] {
  try {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(text);
      if (parsed.drillIds && Array.isArray(parsed.drillIds)) {
        return parsed.drillIds;
      }
      if (parsed.recommendedDrills && Array.isArray(parsed.recommendedDrills)) {
        return parsed.recommendedDrills;
      }
      if (parsed.drills && Array.isArray(parsed.drills)) {
        return parsed.drills;
      }
    } catch (e) {
      // Not JSON, continue with regex approach
    }

    // Fallback to regex pattern matching
    const idPatterns = [
      /drillId[s]?:\s*\[(.*?)\]/i,
      /drill ID[s]?:\s*\[(.*?)\]/i,
      /recommended drill[s]?:\s*\[(.*?)\]/i,
      /recommended drillId[s]?:\s*\[(.*?)\]/i,
      /drill[s]? to use:\s*\[(.*?)\]/i
    ];

    for (const pattern of idPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Extract IDs from the matched string
        const idsString = match[1].replace(/"/g, '').replace(/'/g, '');
        return idsString.split(',').map(id => id.trim());
      }
    }

    // If no array pattern found, look for individually mentioned IDs
    const individualIds = text.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g);
    if (individualIds && individualIds.length > 0) {
      return individualIds;
    }

    // Last resort - look for any mentioned drills by number references
    const numberedDrills = text.match(/drill\s+(\d+)|(\d+)[\.\)]\s+drill/gi);
    if (numberedDrills && numberedDrills.length > 0) {
      // Extract just the numbers
      const numbers = numberedDrills.map(match => {
        const num = match.match(/\d+/);
        return num ? parseInt(num[0], 10) - 1 : -1; // Convert to zero-based index
      }).filter(n => n >= 0);
      
      // Return these as string numbers for later conversion to actual drills
      return numbers.map(n => n.toString());
    }

    return [];
  } catch (error) {
    console.error("Error extracting drill IDs:", error);
    return [];
  }
}

/**
 * Get recommended drills in order from the available drills and extracted IDs
 * @param drills Available drills
 * @param drillIds Extracted drill IDs
 * @returns Array of recommended drills
 */
export function getRecommendedDrills(allDrills: Drill[], drillIds: string[]): Drill[] {
  if (!allDrills || !drillIds || drillIds.length === 0) {
    return [];
  }

  // If numeric strings like "0", "1", "2" are passed, interpret as indices
  if (drillIds.every(id => /^\d+$/.test(id))) {
    return drillIds
      .map(id => {
        const index = parseInt(id, 10);
        return index >= 0 && index < allDrills.length ? allDrills[index] : null;
      })
      .filter((drill): drill is Drill => drill !== null);
  }

  // Otherwise try to match by UUID
  const recommendedDrills = drillIds
    .map(id => allDrills.find(drill => drill.id === id))
    .filter((drill): drill is Drill => drill !== undefined);

  // If we still have no matches, try fuzzy matching by title substring
  if (recommendedDrills.length === 0) {
    for (const id of drillIds) {
      // Try to find drills with titles containing the ID string
      const matchingDrills = allDrills.filter(drill => 
        drill.title && drill.title.toLowerCase().includes(id.toLowerCase())
      );
      if (matchingDrills.length > 0) {
        recommendedDrills.push(...matchingDrills);
      }
    }
  }

  // Deduplicate results based on ID
  const uniqueDrills: { [key: string]: Drill } = {};
  for (const drill of recommendedDrills) {
    if (drill.id) {
      uniqueDrills[drill.id] = drill;
    }
  }

  // If nothing matched, return the first 3 drills as fallback
  if (Object.keys(uniqueDrills).length === 0 && allDrills.length > 0) {
    return allDrills.slice(0, 3);
  }

  return Object.values(uniqueDrills);
}

/**
 * Generate AI prompt for selecting the best drills
 * @returns System prompt for OpenAI
 */
export function generateAISystemPrompt(): string {
  return `
You are a professional golf coach specializing in analyzing golf issues and recommending appropriate practice drills.

Your task is to:
1. Analyze the user's golf issue or problem
2. Select the most relevant drills from the provided database to help address the issue
3. Return ONLY the IDs of the 2-4 most effective drills for this specific problem

Return your response as a simple list of drill IDs in the format: 
\`\`\`
drillIds: ["id1", "id2", "id3"]
\`\`\`

Do not include any explanation or additional text - ONLY the JSON format with the selected drill IDs.
`;
}

/**
 * Generate AI prompt for providing analysis text
 * @returns System prompt for OpenAI
 */
export function generateAnalysisPrompt(): string {
  return `
You are a professional golf coach providing clear, actionable advice to players.

Analyze the golfer's issue and the recommended drills, then provide:

1. A concise diagnosis of their problem (1-2 sentences)
2. Brief explanation of how the recommended drills will help (2-3 sentences)
3. Clear, practical instructions on how to implement these drills effectively (3-4 sentences)

Your response should be formatted as normal text (not JSON). Be encouraging, specific, and focused on solving their issue.
Avoid technical jargon and keep your response under 200 words.
`;
}
