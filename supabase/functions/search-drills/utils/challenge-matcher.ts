
import type { Challenge } from "../types.ts";

export function selectRelevantChallenge(
  challenges: Challenge[],
  query: string
): Challenge | null {
  if (!challenges || challenges.length === 0) {
    return null;
  }

  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();

  // Extract key terms from the query
  const terms = extractKeyTerms(lowerQuery);

  // Score each challenge based on relevance
  const scoredChallenges = challenges.map(challenge => {
    const score = calculateChallengeRelevance(challenge, terms, lowerQuery);
    return { challenge, score };
  });

  // Sort by score (highest first) and take the best match
  scoredChallenges.sort((a, b) => b.score - a.score);

  // Only return a challenge if it has a meaningful score
  if (scoredChallenges.length > 0 && scoredChallenges[0].score > 0.3) {
    return scoredChallenges[0].challenge;
  }

  return null;
}

function extractKeyTerms(query: string): string[] {
  // Define golf-related problem areas
  const problemAreas = [
    "putt", "putting", "driver", "drive", "slice", "hook", 
    "chip", "chipping", "pitch", "pitching", "bunker", "sand", 
    "iron", "wedge", "distance", "accuracy", "consistency",
    "top", "thin", "fat", "chunk", "skull"
  ];

  // Extract terms that appear in the query
  return problemAreas.filter(term => query.includes(term));
}

function calculateChallengeRelevance(
  challenge: Challenge,
  terms: string[],
  fullQuery: string
): number {
  // Convert challenge content to lowercase
  const challengeText = [
    challenge.title || '',
    challenge.description || '',
    challenge.category || '',
    challenge.instruction1 || '',
    challenge.instruction2 || '',
    challenge.instruction3 || ''
  ].join(' ').toLowerCase();

  let score = 0;
  
  // Direct category match is a strong signal
  if (challenge.category && fullQuery.includes(challenge.category.toLowerCase())) {
    score += 0.5;
  }
  
  // Check for key term matches
  for (const term of terms) {
    if (challengeText.includes(term)) {
      score += 0.2;
      
      // Extra points for title matches
      if (challenge.title?.toLowerCase().includes(term)) {
        score += 0.2;
      }
    }
  }
  
  // Special case handling for common problems
  if (fullQuery.includes("putt") && (challengeText.includes("putt") || challengeText.includes("green"))) {
    score += 0.3;
  }
  
  if ((fullQuery.includes("bunker") || fullQuery.includes("sand")) && 
      (challengeText.includes("bunker") || challengeText.includes("sand"))) {
    score += 0.3;
  }
  
  if ((fullQuery.includes("slice") || fullQuery.includes("hook")) && 
      (challengeText.includes("slice") || challengeText.includes("hook") || 
       challengeText.includes("path") || challengeText.includes("face"))) {
    score += 0.3;
  }

  return score;
}
