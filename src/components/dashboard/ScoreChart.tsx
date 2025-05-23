
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreData {
  date: string;
  score: number;
  courseName: string;
  totalPar: number;
  location: string;
  holeCount: number;
}

// A simple line chart representation for React Native
const SimpleLineChart = ({ data }: { data: ScoreData[] }) => {
  if (data.length === 0) return null;
  
  const scores = data.map(item => item.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = Math.max(maxScore - minScore, 1);
  
  const chartHeight = 150;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartContent}>
        {data.map((item, index) => {
          const normalizedHeight = ((maxScore - item.score) / range) * chartHeight;
          
          return (
            <View key={index} style={styles.dataPoint}>
              <View 
                style={[
                  styles.dataLine,
                  { height: normalizedHeight },
                ]}
              >
                <View style={styles.dataMarker} />
              </View>
              <Text style={styles.dateLabel}>{item.date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const ScoreChart = () => {
  // Sample data for demonstration
  const sampleScoreData: ScoreData[] = [
    { date: 'Jan 15', score: 92, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Feb 12', score: 87, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Mar 10', score: 85, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Mar 24', score: 83, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
  ];
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Scores</Text>
        <Text style={styles.description}>
          Your last {sampleScoreData.length} rounds
        </Text>
      </View>
      
      <View style={styles.content}>
        <SimpleLineChart data={sampleScoreData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    height: 400,
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
    flex: 1,
  },
  chartContent: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 20,
  },
  dataPoint: {
    alignItems: 'center',
    width: 40,
  },
  dataLine: {
    width: 2,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dataMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginTop: -5,
  },
  dateLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default ScoreChart;
