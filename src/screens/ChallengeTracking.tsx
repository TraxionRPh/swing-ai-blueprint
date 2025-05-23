
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChallengeTracking = ({ route, navigation }) => {
  const [score, setScore] = useState('');
  const challengeId = route.params?.challengeId;
  
  const handleSubmit = () => {
    // Here you would submit the score to your backend
    console.log(`Submitting score: ${score} for challenge ID: ${challengeId}`);
    
    // Navigate to history after submission
    navigation.navigate('ChallengeHistory');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge Tracking</Text>
        <Text style={styles.description}>
          Track your progress on current challenges.
        </Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Putting Accuracy Challenge</Text>
        <Text style={styles.cardDescription}>
          Complete 20 putts from 6 feet distance. Record how many successful putts you made.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Score (out of 20):</Text>
          <TextInput
            style={styles.input}
            value={score}
            onChangeText={setScore}
            keyboardType="numeric"
            placeholder="Enter score"
            placeholderTextColor="#6B7280"
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Score</Text>
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
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 4,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ChallengeTracking;
