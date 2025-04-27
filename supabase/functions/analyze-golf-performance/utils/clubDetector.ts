
/**
 * Detects club type based on text description
 * @param description - Club description or problem text
 * @returns The detected club type
 */
export function detectClubType(description: string): string {
  // Convert to lowercase once for all checks
  const text = description.toLowerCase();
  
  // Use a Map for more efficient lookups
  const clubMatches = new Map([
    ['driver', ['driver', 'tee shot', 'off the tee', '1 wood']],
    ['woods', ['wood', '3 wood', '5 wood', 'fairway wood']],
    ['hybrid', ['hybrid', 'rescue']],
    ['iron', ['iron', '4 iron', '5 iron', '6 iron', '7 iron', '8 iron', '9 iron']],
    ['wedge', ['wedge', 'pw', 'gw', 'sw', 'lw', 'sand wedge', 'lob wedge', 'gap wedge', 'pitch']],
    ['putter', ['putt', 'putter', 'green']]
  ]);

  // Check for specific clubs first
  for (const [club, patterns] of clubMatches.entries()) {
    if (patterns.some(pattern => text.includes(pattern))) {
      return club;
    }
  }
  
  // Check more context-based patterns
  if (text.includes('slice') || text.includes('hook') || text.includes('draw') || text.includes('fade')) {
    // These issues are most common with driver or woods
    return text.includes('approach') ? 'iron' : 'driver';
  }
  
  if (text.includes('chip') || text.includes('bunker') || text.includes('sand')) {
    return 'wedge';
  }
  
  if (text.includes('short game')) {
    return 'wedge';
  }
  
  // Default to general if no specific club is detected
  return 'general';
}
