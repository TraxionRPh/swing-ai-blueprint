import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LucideGolf } from '@/components/icons/CustomIcons';
import { useRouter } from 'expo-router';
import { supabase } from '../integrations/supabase/client';
import type { Challenge } from '@/types/challenge';

export default function ChallengeLibrary() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10B981';
      case 'Intermediate':
        return '#F59E0B';
      case 'Advanced':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  useEffect(() => {
    supabase
      .from('challenges')
      .select('id, title, description, difficulty, category, metrics, instructions, totalAttempts')
      .order('title', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading challenges:', error);
        } else {
          setChallenges(data ?? []);
        }
        setLoading(false);
      });
  }, []);
  
  const renderChallenge = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.challengeDescription}>{item.description}</Text>

      <View style={styles.metricsContainer}>
        {item.metrics?.map((metric) => (
          <View key={metric} style={styles.metricBadge}>
            <Text style={styles.metricText}>{metric}</Text>
          </View>
        ))}
      </View>

      <View style={styles.challengeFooter}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            router.push({
              pathname: '/ChallengeTracking',
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.startButtonText}>Start Challenge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() =>
            router.push({
              pathname: '/ChallengeHistory',
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge Library</Text>
        <Text style={styles.subtitle}>Improve your skills with focused challenges</Text>
      </View>
      
      <View style={styles.featuredChallenge}>
        <View style={styles.featuredIcon}>
          <LucideGolf width={24} height={24} color="#FFFFFF" />
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>Weekly Challenge</Text>
          <Text style={styles.featuredDescription}>Complete the 60-second putting challenge</Text>
          <TouchableOpacity style={styles.featuredButton}>
            <Text style={styles.featuredButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item: { id: any; }) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No challenges available yet.
            </Text>
          </View>
        }
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
  featuredChallenge: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  featuredButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  challengeFooter: {
    flexDirection: 'row',
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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyStateText: { fontSize: 16, color: '#94A3B8' },
});