
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy data for challenges
const dummyChallenges = [
  {
    id: '1',
    title: 'Putting Accuracy',
    description: 'Complete 20 putts from 6 feet distance'
  },
  {
    id: '2',
    title: 'Drive Distance',
    description: 'Hit 10 drives over 200 yards'
  },
  {
    id: '3',
    title: 'Sand Trap Escape',
    description: 'Practice 15 bunker shots with proper technique'
  }
];

const ChallengeItem = ({ title, description }) => (
  <View style={styles.challengeCard}>
    <Text style={styles.challengeTitle}>{title}</Text>
    <Text style={styles.challengeDescription}>{description}</Text>
  </View>
);

const ChallengeLibrary = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge Library</Text>
        <Text style={styles.description}>
          Browse challenges to improve your golf game.
        </Text>
      </View>
      
      <FlatList
        data={dummyChallenges}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChallengeItem title={item.title} description={item.description} />
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
  challengeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  }
});

export default ChallengeLibrary;
