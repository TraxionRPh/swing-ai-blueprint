import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Trophy } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';
import type { Challenge } from '@/types/challenge';

export default function ChallengeTracking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState('');
  const [isInProgress, setIsInProgress] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('challenges')
      .select(`
        id,
        title,
        description,
        difficulty,
        totalAttempts,
        metrics,
        instructions
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setChallenge(data);
      });
      setLoading(false);
  }, [id]);

  if (!challenge) {
    return <Text>Loading…</Text>;
  }
  
  const startChallenge = () => {
    setIsInProgress(true);
    // Start a timer in a real app
  };
  
  const completeChallenge = () => {
    // TODO: save score
    router.push({
      pathname: '/ChallengeHistory',
      params: { id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'white', padding: 16 }}>
          Challenge not found.
        </Text>
      </SafeAreaView>
    );
  }

  const total =
    challenge.totalAttempts ?? challenge.totalAttempts ?? 0;
  
  const successPercentage =
    total > 0
      ? Math.round((parseInt(score, 10) / total) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.challengeInfo}>
            <Text style={styles.title}>{challenge.title}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
        
        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {challenge.instructions?.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
        
        {isInProgress ? (
          <View style={styles.trackingSection}>
            <View style={styles.timerCard}>
              <Clock width={24} height={24} color="#FFFFFF" />
              <Text style={styles.timerText}>00:00</Text>
              <TouchableOpacity style={styles.pauseButton}>
                <Text style={styles.pauseButtonText}>Pause</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.scoreInputSection}>
              <Text style={styles.scoreInputLabel}>Your Score (out of {challenge.totalAttempts})</Text>
              <TextInput
                style={styles.scoreInput}
                placeholder="Enter your score"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                maxLength={2}
                value={score}
                onChangeText={setScore}
              />
              {score !== '' && (
                <Text style={styles.successRate}>
                  Success rate: {successPercentage}%
                </Text>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.completeButton,
                  (!score || parseInt(score, 10) > total) && styles.disabledButton
                ]}
                disabled={!score || parseInt(score, 10) > total}
                onPress={completeChallenge}
              >
                <Trophy width={16} height={16} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Complete Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.startSection}>
            <Text style={styles.readyText}>Ready to start the challenge?</Text>
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={startChallenge}
            >
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  challengeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#1E293B',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#10B981',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  startSection: {
    padding: 16,
    alignItems: 'center',
  },
  readyText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  trackingSection: {
    padding: 16,
  },
  timerCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  pauseButtonText: {
    color: '#FFFFFF',
  },
  scoreInputSection: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
  },
  scoreInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  scoreInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  successRate: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  }
});