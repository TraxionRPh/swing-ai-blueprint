
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RoundDetail = ({ route }) => {
  // In a real app, we would fetch the round details using the ID
  const { roundId } = route.params || { roundId: '1' };
  
  // Sample round data for UI demonstration
  const roundData = {
    id: roundId,
    date: 'May 20, 2025',
    course: 'Pine Valley Golf Club',
    location: 'Pine Valley, NJ',
    score: 82,
    par: 72,
    holes: Array(18).fill(null).map((_, i) => ({
      number: i + 1,
      par: 4,
      score: 4 + (Math.random() > 0.7 ? 1 : 0),
      putts: 2,
      fairway: Math.random() > 0.3,
      gir: Math.random() > 0.4,
    })),
  };

  const calculateStats = () => {
    const fairwaysHit = roundData.holes.filter(h => h.fairway).length;
    const greensHit = roundData.holes.filter(h => h.gir).length;
    const totalPutts = roundData.holes.reduce((sum, h) => sum + h.putts, 0);
    
    return {
      fairwayPercentage: Math.round((fairwaysHit / 14) * 100), // Assuming 14 holes with fairways (exclude par 3s)
      girPercentage: Math.round((greensHit / 18) * 100),
      puttsPerHole: (totalPutts / 18).toFixed(1),
    };
  };
  
  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.courseName}>{roundData.course}</Text>
          <Text style={styles.courseLocation}>{roundData.location}</Text>
          <Text style={styles.roundDate}>{roundData.date}</Text>
          
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{roundData.score}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{roundData.score - roundData.par}</Text>
              <Text style={styles.scoreLabel}>To Par</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Round Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.fairwayPercentage}%</Text>
              <Text style={styles.statLabel}>Fairways</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.girPercentage}%</Text>
              <Text style={styles.statLabel}>Greens</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.puttsPerHole}</Text>
              <Text style={styles.statLabel}>Putts/Hole</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.holesSection}>
          <Text style={styles.sectionTitle}>Hole-by-Hole</Text>
          <View style={styles.holesHeader}>
            <Text style={[styles.holeHeaderText, styles.holeNumber]}>Hole</Text>
            <Text style={[styles.holeHeaderText, styles.holePar]}>Par</Text>
            <Text style={[styles.holeHeaderText, styles.holeScore]}>Score</Text>
            <Text style={[styles.holeHeaderText, styles.holeStat]}>Putts</Text>
            <Text style={[styles.holeHeaderText, styles.holeStat]}>FIR</Text>
            <Text style={[styles.holeHeaderText, styles.holeStat]}>GIR</Text>
          </View>
          
          {roundData.holes.map(hole => (
            <View key={hole.number} style={styles.holeRow}>
              <Text style={[styles.holeText, styles.holeNumber]}>{hole.number}</Text>
              <Text style={[styles.holeText, styles.holePar]}>{hole.par}</Text>
              <Text style={[styles.holeText, styles.holeScore, 
                hole.score < hole.par ? styles.birdie : 
                hole.score > hole.par ? styles.bogey : styles.par
              ]}>
                {hole.score}
              </Text>
              <Text style={[styles.holeText, styles.holeStat]}>{hole.putts}</Text>
              <Text style={[styles.holeText, styles.holeStat]}>{hole.fairway ? '✓' : '✗'}</Text>
              <Text style={[styles.holeText, styles.holeStat]}>{hole.gir ? '✓' : '✗'}</Text>
            </View>
          ))}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  courseLocation: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
  },
  roundDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    margin: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  holesSection: {
    padding: 16,
  },
  holesHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  holeHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    textAlign: 'center',
  },
  holeRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  holeText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  holeNumber: {
    flex: 1,
  },
  holePar: {
    flex: 1,
  },
  holeScore: {
    flex: 1,
    fontWeight: 'bold',
  },
  holeStat: {
    flex: 1,
  },
  birdie: {
    color: '#10B981', // green
  },
  par: {
    color: '#FFFFFF', // white
  },
  bogey: {
    color: '#EF4444', // red
  },
});

export default RoundDetail;
