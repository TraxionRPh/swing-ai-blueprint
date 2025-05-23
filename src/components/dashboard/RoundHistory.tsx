
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface Round {
  id: string;
  date: string;
  total_score: number;
  golf_courses: {
    name: string;
    city: string;
    state: string;
  };
}

export const RoundHistory = () => {
  // Sample data for demonstration
  const rounds = [
    {
      id: '1',
      date: '2025-05-15',
      total_score: 82,
      golf_courses: {
        name: 'Pine Valley Golf Club',
        city: 'Pine Valley',
        state: 'NJ'
      }
    },
    {
      id: '2',
      date: '2025-05-08',
      total_score: 85,
      golf_courses: {
        name: 'Augusta National',
        city: 'Augusta',
        state: 'GA'
      }
    },
    {
      id: '3',
      date: '2025-05-01',
      total_score: 79,
      golf_courses: {
        name: 'Pebble Beach',
        city: 'Pebble Beach',
        state: 'CA'
      }
    }
  ];

  const renderRound = ({ item }: { item: Round }) => (
    <View style={styles.roundRow}>
      <View style={styles.dateCol}>
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.courseCol}>
        <Text style={styles.courseText}>
          {item.golf_courses.name} - {item.golf_courses.city}
        </Text>
      </View>
      <View style={styles.scoreCol}>
        <Text style={styles.scoreText}>{item.total_score || '-'}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.dateCol}>
        <Text style={styles.headerText}>Date</Text>
      </View>
      <View style={styles.courseCol}>
        <Text style={styles.headerText}>Course</Text>
      </View>
      <View style={styles.scoreCol}>
        <Text style={styles.headerText}>Score</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Rounds</Text>
      </View>
      <View style={styles.content}>
        {rounds.length > 0 ? (
          <FlatList
            data={rounds}
            keyExtractor={(item) => item.id}
            renderItem={renderRound}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rounds found</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A50',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A50',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  roundRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A50',
  },
  dateCol: {
    flex: 1,
  },
  courseCol: {
    flex: 2,
  },
  scoreCol: {
    width: 60,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  courseText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default RoundHistory;
