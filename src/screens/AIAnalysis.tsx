
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AIAnalysis = () => {
  // Sample analysis data
  const analysisData = [
    {
      id: '1',
      title: 'Putting Performance',
      description: 'Your putting has improved by 15% over the last month',
      feedback: 'Continue working on short range putts for more consistency.'
    },
    {
      id: '2',
      title: 'Drive Distance',
      description: 'Your average drive distance is 220 yards',
      feedback: 'Focus on hip rotation to generate more power in your swing.'
    },
    {
      id: '3',
      title: 'Approach Shots',
      description: 'Your approach shot accuracy is above average',
      feedback: 'Practice with different clubs to improve versatility.'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Analysis</Text>
        <Text style={styles.description}>
          Your personalized AI analysis and recommendations.
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {analysisData.map(item => (
          <View key={item.id} style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>{item.title}</Text>
            <Text style={styles.analysisDescription}>{item.description}</Text>
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>AI Recommendation:</Text>
              <Text style={styles.feedbackText}>{item.feedback}</Text>
            </View>
          </View>
        ))}
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Assessment</Text>
          <Text style={styles.summaryText}>
            Based on your recent performance, focus on putting practice and short game
            consistency. Your driving has shown good improvement. Consider scheduling
            a session with a golf instructor to fine-tune your swing mechanics.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  analysisCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  analysisDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  feedbackContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 4,
    padding: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  }
});

export default AIAnalysis;
