
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';

const sampleRounds = [
  { id: '1', date: 'May 20, 2025', course: 'Pine Valley Golf Club', score: 82 },
  { id: '2', date: 'May 15, 2025', course: 'Augusta National', score: 86 },
  { id: '3', date: 'May 8, 2025', course: 'Pebble Beach Golf Links', score: 84 },
];

const RoundsList = ({ navigation }) => {
  const renderRoundItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.roundCard}
      onPress={() => navigation.navigate('RoundDetail', { roundId: item.id })}
    >
      <View style={styles.roundHeader}>
        <Text style={styles.courseName}>{item.course}</Text>
        <Text style={styles.scoreCard}>{item.score}</Text>
      </View>
      <Text style={styles.roundDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rounds History</Text>
        <Text style={styles.subtitle}>Track your golf game progress</Text>
      </View>
      
      <View style={styles.content}>
        {sampleRounds.length > 0 ? (
          <FlatList
            data={sampleRounds}
            keyExtractor={(item) => item.id}
            renderItem={renderRoundItem}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Calendar width={48} height={48} color="#64748B" />
            <Text style={styles.emptyStateText}>No rounds recorded yet</Text>
            <TouchableOpacity 
              style={styles.addRoundButton}
              onPress={() => navigation.navigate('RoundTracking')}
            >
              <Text style={styles.addRoundButtonText}>Track New Round</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => navigation.navigate('RoundTracking')}
        >
          <Text style={styles.floatingButtonText}>+ New Round</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  roundCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scoreCard: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  roundDate: {
    fontSize: 14,
    color: '#94A3B8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  addRoundButton: {
    marginTop: 24,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addRoundButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  floatingButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});

export default RoundsList;
