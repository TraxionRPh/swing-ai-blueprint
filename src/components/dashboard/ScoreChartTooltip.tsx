
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      courseName: string;
      date: string;
      score: number;
      totalPar: number;
      location: string;
    };
  }>;
  label?: string;
}

export const ScoreChartTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const score = data.score;
  const totalPar = data.totalPar || 72;
  const toPar = score - totalPar;
  const toParText = toPar > 0 ? `+${toPar}` : toPar === 0 ? 'E' : toPar.toString();

  return (
    <View style={styles.tooltip}>
      <Text style={styles.courseName}>{data.courseName}</Text>
      <Text style={styles.location}>{data.location}</Text>
      <Text style={styles.date}>{data.date}</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score:</Text>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.toPar}>({toParText})</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: '#1A2234',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A3A50',
  },
  courseName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 4,
  },
  toPar: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default ScoreChartTooltip;
