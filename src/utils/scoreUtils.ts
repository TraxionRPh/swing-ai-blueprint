
export const compareScores = (oldScore: string, newScore: string, metric?: string): boolean => {
  const parseScore = (score: string) => {
    if (score.includes('%')) {
      return parseFloat(score);
    }
    else if (score.includes('yards') || score.includes('yd')) {
      return parseFloat(score);
    }
    else {
      return parseFloat(score);
    }
  };
  
  const oldValue = parseScore(oldScore);
  const newValue = parseScore(newScore);
  
  if (metric && ['distance', 'yards', 'feet'].some(m => metric.toLowerCase().includes(m))) {
    return newValue > oldValue;
  }
  
  if (metric && ['accuracy', 'percentage', 'success'].some(m => metric.toLowerCase().includes(m))) {
    return newValue > oldValue;
  }
  
  return newValue < oldValue;
};
