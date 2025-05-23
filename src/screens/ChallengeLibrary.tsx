
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy data for challenges
const dummyChallenges = [
  {
    id: '1',
    title: 'Putting Accuracy',
    description: 'Complete 20 putts from 6 feet distance',
    difficulty: 'Medium',
    category: 'Putting'
  },
  {
    id: '2',
    title: 'Drive Distance',
    description: 'Hit 10 drives over 200 yards',
    difficulty: 'Hard',
    category: 'Driving'
  },
  {
    id: '3',
    title: 'Sand Trap Escape',
    description: 'Practice 15 bunker shots with proper technique',
    difficulty: 'Medium',
    category: 'Short Game'
  }
];

const ChallengeItem = ({ title, description, difficulty, category, onPress }) => (
  <TouchableOpacity style={styles.challengeCard} onPress={onPress}>
    <View style={styles.challengeHeader}>
      <Text style={styles.challengeTitle}>{title}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{difficulty}</Text>
      </View>
    </View>
    <Text style={styles.challengeDescription}>{description}</Text>
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryText}>{category}</Text>
    </View>
  </TouchableOpacity>
);

const ChallengeLibrary = ({ navigation }) => {
  const handleChallengePress = (challengeId) => {
    navigation.navigate('ChallengeTracking', { challengeId });
  };
  
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
          <ChallengeItem 
            title={item.title} 
            description={item.description}
            difficulty={item.difficulty}
            category={item.category}
            onPress={() => handleChallengePress(item.id)}
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
  challengeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '500',
  }
});

export default ChallengeLibrary;
