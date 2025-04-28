
/**
 * Helper module for matching relevant challenges in the search-drills function
 */

/**
 * Select a relevant challenge based on the search query with enhanced bunker detection
 * 
 * @param challenges Array of available challenges
 * @param query User search query
 * @returns Most relevant challenge or null
 */
export function selectRelevantChallenge(challenges: any[], query: string) {
  if (!challenges || challenges.length === 0 || !query) {
    return null;
  }

  console.log(`Finding best challenge match for query: ${query}`);
  const lowerQuery = query.toLowerCase();
  
  // Special handling for bunker-related queries with higher priority
  if (lowerQuery.includes('bunker') || lowerQuery.includes('sand')) {
    console.log("🏖️ BUNKER QUERY DETECTED - Using special bunker challenge selection");
    return selectBunkerChallenge(challenges, lowerQuery);
  }
  
  // Handle other types of queries
  return selectGeneralChallenge(challenges, lowerQuery);
}

/**
 * Special selection algorithm for bunker-related challenges
 */
function selectBunkerChallenge(challenges: any[], query: string) {
  // First try to find exact bunker challenges with enhanced scoring
  const scoredChallenges = challenges
    .filter(c => {
      const text = [
        c.title || '',
        c.description || '', 
        c.category || '',
        c.instruction1 || '',
        c.instruction2 || '',
        c.instruction3 || ''
      ].join(' ').toLowerCase();
      
      return text.includes('bunker') || text.includes('sand');
    })
    .map(c => {
      const text = [
        c.title || '',
        c.description || '', 
        c.category || '',
        c.instruction1 || '',
        c.instruction2 || '',
        c.instruction3 || ''
      ].join(' ').toLowerCase();
      
      let score = 0;
      
      // Scoring based on bunker terminology in different fields
      if ((c.title || '').toLowerCase().includes('bunker')) score += 10;
      if ((c.category || '').toLowerCase().includes('bunker')) score += 8;
      if ((c.instruction1 || '').toLowerCase().includes('bunker') || 
          (c.instruction1 || '').toLowerCase().includes('sand')) score += 6;
      if ((c.instruction2 || '').toLowerCase().includes('bunker') || 
          (c.instruction2 || '').toLowerCase().includes('sand')) score += 5;
      if (text.includes('explosion')) score += 7;
      if (text.includes('sand shot')) score += 7;
      if (text.includes('splash')) score += 6;
      
      console.log(`Bunker challenge "${c.title}" scored: ${score}`);
      
      return { challenge: c, score };
    });
  
  // Sort by score and select highest
  const sortedChallenges = scoredChallenges.sort((a, b) => b.score - a.score);
  if (sortedChallenges[0] && sortedChallenges[0].score > 0) {
    console.log(`Selected bunker challenge: ${sortedChallenges[0].challenge.title} with score ${sortedChallenges[0].score}`);
    return sortedChallenges[0].challenge;
  }
  
  // If no bunker-specific challenges found, return null
  console.log("No suitable bunker challenges found");
  return null;
}

/**
 * General challenge selection for non-bunker queries
 */
function selectGeneralChallenge(challenges: any[], query: string) {
  // Filter challenges by relevance to query
  const relevantChallenges = challenges.map(c => {
    const text = [
      c.title || '',
      c.description || '', 
      c.category || '',
      c.instruction1 || '',
      c.instruction2 || '',
      c.instruction3 || ''
    ].join(' ').toLowerCase();
    
    // Calculate relevance score based on query terms
    const queryTerms = query.split(/\s+/).filter(term => term.length > 3);
    const matchCount = queryTerms.filter(term => text.includes(term)).length;
    const score = matchCount / Math.max(1, queryTerms.length);
    
    return { challenge: c, score };
  });
  
  // Sort by relevance score and get best match
  const sortedChallenges = relevantChallenges.sort((a, b) => b.score - a.score);
  
  if (sortedChallenges[0] && sortedChallenges[0].score > 0.2) {
    console.log(`Selected general challenge: ${sortedChallenges[0].challenge.title} with score ${sortedChallenges[0].score}`);
    return sortedChallenges[0].challenge;
  }
  
  return null;
}
