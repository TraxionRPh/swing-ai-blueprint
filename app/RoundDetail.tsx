import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';
import { HoleData, RoundWithCourse } from '@/types/round-tracking'

export default function RoundDetail() {
  const { roundId } = useLocalSearchParams<{ roundId: string }>();
  const [round, setRound] = useState<RoundWithCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roundId) return;

    const fetchRound = async () => {
      setLoading(true);

      const { data: round, error: roundErr } = await supabase
        .from('rounds')
        .select('id, course_id, date, total_score, hole_count, user_id')
        .eq('id', roundId)
        .single();

      if (roundErr || !round) {
        console.error('Error fetching round:', roundErr);
        setLoading(false);
        return;
      }

      const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('name, city, state')
        .eq('id', round.course_id)
        .single();

      if (courseErr || !course) {
        console.error('Error fetching course:', courseErr);
        setLoading(false);
        return;
      }

      const { data: holes, error: holesErr } = await supabase
        .from('round_holes')
        .select('hole_number, par, score, putts, fir, gir')
        .eq('round_id', roundId)
        .order('hole_number', { ascending: true });

      if (holesErr) {
        console.error('Error fetching holes:', holesErr);
      }

      if (round) {
        const holeData: HoleData[] = (holes ?? []).map(h => ({
          holeNumber:            h.hole_number,
          par:                   h.par,
          //distance:              h.distance_yards,
          score:                 h.score,
          putts:                 h.putts,
          fairwayHit:            h.fir,
          greenInRegulation:     h.gir,
        }));

      const fullRound: RoundWithCourse = {
        id:         round.id,
        courseId:   round.course_id,
        date:       new Date(round.date),
        totalScore: round.total_score ?? undefined,
        holeCount:  round.hole_count,
        userId:     round.user_id,
        courseName:   course.name,
        courseCity:   course.city,
        courseState:  course.state,
        holes:        holeData,
      };

      setRound(fullRound);
      }

      setLoading(false);
    };
    fetchRound();
  }, [roundId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!round) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#fff' }}>No round found.</Text>
      </View>
    )
  }

  const calculateStats = () => {
    const nonPar3Count = round.holes.filter(h => h.par !== 3).length;
    const fairwaysHit = round.holes.filter(h => h.fairwayHit).length;
    const greensHit = round.holes.filter(h => h.greenInRegulation).length;
    const totalPutts = round.holes.reduce((sum, h) => sum + h.putts, 0);
    
    return {
      fairwayPercentage: nonPar3Count > 0
        ? Math.round((fairwaysHit / nonPar3Count) * 100)
        : 0,
      girPercentage: round.holeCount > 0
        ? Math.round((greensHit / round.holeCount) * 100)
        : 0,
      puttsPerHole: round.holeCount > 0
        ? (totalPutts / round.holeCount).toFixed(1)
        : '0.0',
    };
  };
  
  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
        <Text style={styles.courseName}>{round.courseName}</Text>
        <Text style={styles.courseLocation}>
          {round.courseCity}, {round.courseState}
        </Text>
          <Text style={styles.roundDate}>{round.date.toDateString()}</Text>
          
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{round.totalScore}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>
                {round.totalScore! - round.holeCount * (par => par)(4)}
              </Text>
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
            {['#', 'Par', 'Score', 'Putts', 'FIR', 'GIR'].map(h => (
              <Text key={h} style={[styles.holeHeaderText, styles.holeStat]}>
                {h}
              </Text>
            ))}
          </View>
          
          {round.holes.map(h => (
            <View key={h.holeNumber} style={styles.holeRow}>
              <Text style={[styles.holeText, styles.holeStat]}>
                {h.holeNumber}
              </Text>
              <Text style={[styles.holeText, styles.holeStat]}>
                {h.par}
              </Text>
              <Text
                style={[
                  styles.holeText,
                  styles.holeStat,
                  h.score < h.par
                    ? styles.birdie
                    : h.score > h.par
                    ? styles.bogey
                    : styles.par,
                ]}
              >
                {h.score}
              </Text>
              <Text style={[styles.holeText, styles.holeStat]}>
                {h.putts}
              </Text>
              <Text style={[styles.holeText, styles.holeStat]}>
                {h.fairwayHit ? '✓' : '✗'}
              </Text>
              <Text style={[styles.holeText, styles.holeStat]}>
                {h.greenInRegulation ? '✓' : '✗'}
              </Text>
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
  loader: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
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
