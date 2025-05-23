
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListTodo } from 'lucide-react-native';

const Dashboard = ({ navigation }: any) => {
  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome back! Here's an overview of your golf performance.
          </Text>
        </View>

        {/* Active Practice Plan Card */}
        <Card style={styles.activePlanCard}>
          <CardHeader>
            <CardTitle>Active Practice Plan</CardTitle>
            <Text style={styles.cardDescription}>
              Continue with your personalized practice plan
            </Text>
          </CardHeader>
          <CardContent>
            <View style={styles.activePlanContent}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>Improving Your Golf Game</Text>
                <Text style={styles.planDescription}>
                  Follow your custom practice plan to enhance your skills
                </Text>
              </View>
              <Button
                onPress={() => navigateToScreen('MyPracticePlans')}
                style={styles.viewPlanButton}
              >
                <ListTodo width={20} height={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>View Plan</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        <View style={styles.statCardsGrid}>
          <Card style={styles.statCard}>
            <CardHeader>
              <CardTitle>Handicap</CardTitle>
              <Text style={styles.cardDescription}>Current handicap index</Text>
            </CardHeader>
            <CardContent>
              <Text style={styles.statValue}>12.4</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardHeader>
              <CardTitle>Best Round</CardTitle>
              <Text style={styles.cardDescription}>Your lowest 18-hole round in past 90 days</Text>
            </CardHeader>
            <CardContent>
              <Text style={styles.statValue}>78</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardHeader>
              <CardTitle>Practice Time</CardTitle>
              <Text style={styles.cardDescription}>Hours practiced this month</Text>
            </CardHeader>
            <CardContent>
              <Text style={styles.statValue}>12</Text>
            </CardContent>
          </Card>
        </View>

        {/* Navigation Cards */}
        <View style={styles.navigationGrid}>
          <Card style={styles.navigationCard}>
            <CardContent style={styles.navigationContent}>
              <Text style={styles.navigationTitle}>Rounds</Text>
              <Button size="sm" onPress={() => navigateToScreen('RoundTracking')}>
                Track Round
              </Button>
            </CardContent>
          </Card>
          
          <Card style={styles.navigationCard}>
            <CardContent style={styles.navigationContent}>
              <Text style={styles.navigationTitle}>Challenges</Text>
              <Button size="sm" onPress={() => navigateToScreen('ChallengesTab')}>
                View Challenges
              </Button>
            </CardContent>
          </Card>
          
          <Card style={styles.navigationCard}>
            <CardContent style={styles.navigationContent}>
              <Text style={styles.navigationTitle}>AI Analysis</Text>
              <Button size="sm" onPress={() => navigateToScreen('AIAnalysis')}>
                View Analysis
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // background color
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981', // primary color
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF', // muted-foreground
  },
  activePlanCard: {
    marginBottom: 16,
    backgroundColor: '#1A1F2C',
    borderColor: '#10B981', // primary color with 20% opacity
    borderWidth: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF', // muted-foreground
  },
  activePlanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  viewPlanButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  statCardsGrid: {
    marginBottom: 16,
  },
  statCard: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  navigationGrid: {
    marginBottom: 16,
  },
  navigationCard: {
    marginBottom: 8,
  },
  navigationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Dashboard;
