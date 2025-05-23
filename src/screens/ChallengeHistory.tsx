
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy data for challenge history
const dummyChallengeHistory = [
  {
    id: '1',
    title: 'Putting Accuracy',
    date: '2025-05-20',
    score: '18/20',
    performance: 'Great'
  },
  {
    id: '2',
    title: 'Drive Distance',
    date: '2025-05-15',
    score: '8/10',
    performance: 'Good'
  },
  {
    id: '3',
    title: 'Sand Trap Escape',
    date: '2025-05-10',
    score: '12/15',
    performance: 'Good'
  }
];

const HistoryItem = ({ title, date, score, performance }) => (
  <View style={styles.historyCard}>
    <Text style={styles.historyTitle}>{title}</Text>
    <View style={styles.historyDetails}>
      <Text style={styles.historyDate}>{date}</Text>
      <Text style={styles.historyScore}>{score}</Text>
    </View>
    <View style={[
      styles.performanceBadge,
      performance === 'Great' ? styles.greatBadge : 
      performance === 'Good' ? styles.goodBadge : styles.averageBadge
    ]}>
      <Text style={styles.performanceText}>{performance}</Text>
    </View>
  </View>
);

const ChallengeHistory = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge History</Text>
        <Text style={styles.description}>
          View your past challenge performances.
        </Text>
      </View>
      
      <FlatList
        data={dummyChallengeHistory}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <HistoryItem 
            title={item.title} 
            date={item.date} 
            score={item.score} 
            performance={item.performance} 
          />
        )}
        contentContainerStyle={styles.listContent}
      />
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyScore: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  performanceBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  greatBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  goodBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  averageBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  }
});

export default ChallengeHistory;
