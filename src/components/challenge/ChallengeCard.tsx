
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
};

export type UserProgress = {
  challenge_id: string;
  best_score: string | null;
  recent_score: string | null;
};

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: UserProgress;
  navigation: any;
}

export const ChallengeCard = ({ challenge, progress, navigation }: ChallengeCardProps) => {
  const handleStartChallenge = () => {
    navigation.navigate('ChallengeTracking', { challengeId: challenge.id });
  };

  const handleViewHistory = () => {
    navigation.navigate('ChallengeHistory', { challengeId: challenge.id });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981'; // green
      case 'Intermediate': return '#F59E0B'; // amber
      case 'Advanced': return '#EF4444'; // red
      default: return '#64748B'; // gray
    }
  };

  const getScoreBackgroundColor = (score: string | null) => {
    if (!score) return '#64748B';
    const numScore = Number(score);
    
    if (numScore >= 8) return '#10B981'; // Good score (green)
    if (numScore >= 5) return '#F59E0B'; // Okay score (amber)
    return '#EF4444'; // Bad score (red)
  };

  const hasProgress = progress && (progress.best_score || progress.recent_score);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{challenge.title}</Text>
        <View style={[styles.badge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
          <Text style={styles.badgeText}>{challenge.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>Challenge Results</Text>
      
      <View style={styles.content}>
        <Text style={styles.description}>{challenge.description}</Text>
        <View style={styles.progressContainer}>
          {hasProgress ? (
            <>
              {progress?.best_score && (
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreName}>Best Score:</Text>
                  <View 
                    style={[
                      styles.scoreBadge, 
                      { backgroundColor: getScoreBackgroundColor(progress.best_score) }
                    ]}
                  >
                    <Text style={styles.scoreText}>{progress.best_score}</Text>
                  </View>
                </View>
              )}
              {progress?.recent_score && (
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreName}>Recent Score:</Text>
                  <View 
                    style={[
                      styles.scoreBadge, 
                      { backgroundColor: getScoreBackgroundColor(progress.recent_score) }
                    ]}
                  >
                    <Text style={styles.scoreText}>{progress.recent_score}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.noAttempts}>No attempts yet</Text>
          )}
        </View>
        <View style={styles.metricsContainer}>
          {challenge.metrics && challenge.metrics.map((metric: string) => (
            <View key={metric} style={styles.metricBadge}>
              <Text style={styles.metricText}>{metric}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartChallenge}
        >
          <Text style={styles.startButtonText}>Start Challenge</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={handleViewHistory}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 16,
    marginBottom: 8,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scoreBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noAttempts: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metricBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  metricText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A3A50',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#10B981',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyButton: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#64748B',
    marginLeft: 8,
  },
  historyButtonText: {
    color: '#FFFFFF',
  },
});

export default ChallengeCard;
