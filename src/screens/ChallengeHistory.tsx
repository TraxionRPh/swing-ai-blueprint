
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, TrendingUp } from 'lucide-react-native';

const ChallengeHistory = ({ route }) => {
  const { challengeId } = route.params || { challengeId: '1' };
  
  // Sample challenge data - in a real app this would be fetched based on challengeId
  const challenge = {
    id: challengeId,
    title: 'Putting Precision',
    description: 'Complete 10 putts from different distances with accuracy.',
    difficulty: 'Beginner',
    totalAttempts: 10,
  };
  
  // Sample history data - in a real app this would be fetched from a database
  const history = [
    { id: '1', date: 'May 22, 2025', score: 7, totalAttempts: 10 },
    { id: '2', date: 'May 15, 2025', score: 6, totalAttempts: 10 },
    { id: '3', date: 'May 8, 2025', score: 5, totalAttempts: 10 },
    { id: '4', date: 'May 1, 2025', score: 4, totalAttempts: 10 },
  ];
  
  const getBestScore = () => {
    if (history.length === 0) return 0;
    return Math.max(...history.map(item => item.score));
  };
  
  const getAverageScore = () => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, item) => acc + item.score, 0);
    return (sum / history.length).toFixed(1);
  };
  
  const getProgressTrend = () => {
    if (history.length < 2) return 'neutral';
    const first = history[history.length - 1].score;
    const last = history[0].score;
    return last > first ? 'improving' : last < first ? 'declining' : 'neutral';
  };
  
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyDate}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.historyScore}>
        <Text style={styles.scoreText}>{item.score} / {item.totalAttempts}</Text>
        <Text style={styles.percentageText}>
          {Math.round((item.score / item.totalAttempts) * 100)}%
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statHeader}>
            <Award width={20} height={20} color="#10B981" />
            <Text style={styles.statTitle}>Performance</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getBestScore()}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getAverageScore()}</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue, 
                getProgressTrend() === 'improving' ? styles.improving : 
                getProgressTrend() === 'declining' ? styles.declining : {}
              ]}>
                {getProgressTrend() === 'improving' ? '↑' : 
                 getProgressTrend() === 'declining' ? '↓' : '–'}
              </Text>
              <Text style={styles.statLabel}>Trend</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Attempt History</Text>
        
        {history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.historyList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No attempts recorded yet</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  improving: {
    color: '#10B981', // green
  },
  declining: {
    color: '#EF4444', // red
  },
  historySection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  historyList: {
    paddingBottom: 16,
  },
  historyItem: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  historyScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default ChallengeHistory;
