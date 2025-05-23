
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Trophy } from 'lucide-react-native';

const ChallengeTracking = ({ route, navigation }) => {
  const { challengeId } = route.params || { challengeId: '1' };
  const [score, setScore] = useState('');
  const [isInProgress, setIsInProgress] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // Sample challenge data - in a real app this would be fetched based on challengeId
  const challenge = {
    id: challengeId,
    title: 'Putting Precision',
    description: 'Complete 10 putts from different distances with accuracy. Place markers at 3, 6, and 9 feet from the hole and attempt to make as many putts as possible.',
    difficulty: 'Beginner',
    totalAttempts: 10,
    instructions: [
      'Set up 10 balls at varying distances from the hole',
      'Try to make as many putts as possible',
      'Record the number of successful putts',
      'Focus on your putting technique and consistency'
    ]
  };
  
  const startChallenge = () => {
    setIsInProgress(true);
    // Start a timer in a real app
  };
  
  const completeChallenge = () => {
    // In a real app, we would save the score here
    navigation.navigate('ChallengeHistory', { challengeId });
  };
  
  const successPercentage = score ? Math.round((parseInt(score, 10) / challenge.totalAttempts) * 100) : 0;

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
          {challenge.instructions.map((instruction, index) => (
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
                  (!score || parseInt(score, 10) > challenge.totalAttempts) && styles.disabledButton
                ]}
                disabled={!score || parseInt(score, 10) > challenge.totalAttempts}
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

export default ChallengeTracking;
