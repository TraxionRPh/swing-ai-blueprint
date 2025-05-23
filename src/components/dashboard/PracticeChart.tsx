
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PracticeData {
  name: string;
  hours: number;
}

// A simple bar representation for React Native
const SimpleBarChart = ({ data }: { data: PracticeData[] }) => {
  const maxHours = Math.max(...data.map(item => item.hours), 1);
  
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barGroup}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${(item.hours / maxHours) * 100}%`,
                  backgroundColor: '#10B981' 
                }
              ]}
            />
            <Text style={styles.barValue}>{item.hours}h</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export const PracticeChart = () => {
  // Sample data for demonstration
  const samplePracticeData = [
    { name: 'Putting', hours: 5 },
    { name: 'Driving', hours: 3 },
    { name: 'Approach', hours: 2 },
    { name: 'Chipping', hours: 4 },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice Focus</Text>
        <Text style={styles.description}>Hours spent by category</Text>
      </View>
      
      <View style={styles.content}>
        <SimpleBarChart data={samplePracticeData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginBottom: 16,
    height: 400,
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
  description: {
    fontSize: 14,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  chartContainer: {
    gap: 16,
  },
  barGroup: {
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  barContainer: {
    height: 24,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  barValue: {
    position: 'absolute',
    right: 8,
    top: 3,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default PracticeChart;
