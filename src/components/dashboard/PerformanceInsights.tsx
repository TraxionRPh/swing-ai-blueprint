
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Loader2 } from 'lucide-react-native';

type InsightPoint = {
  area: string;
  description: string;
};

type PerformanceInsightsProps = {
  isLoading?: boolean;
  error?: string | null;
  strongPoints?: InsightPoint[];
  areasForImprovement?: InsightPoint[];
  isUsingFallbackData?: boolean;
};

export const PerformanceInsights = ({
  isLoading = false,
  error = null,
  strongPoints = [],
  areasForImprovement = [],
  isUsingFallbackData = true
}: PerformanceInsightsProps) => {
  
  // Fallback data for empty states
  const fallbackStrongPoints = [
    { area: "Fairway Accuracy", description: "Consistent improvement in fairway accuracy (+2% over last 5 rounds)" },
    { area: "GIR Percentage", description: "Significant progress in GIR percentage (+5% improvement)" }
  ];
  
  const fallbackAreasForImprovement = [
    { area: "Putting", description: "Average of 1.8 three-putts per round" },
    { area: "Sand Saves", description: "Sand save percentage below target (current: 35%)" }
  ];

  // Use real data if available, otherwise use fallback data
  const displayStrongPoints = strongPoints.length > 0 ? strongPoints : fallbackStrongPoints;
  const displayAreasForImprovement = areasForImprovement.length > 0 ? areasForImprovement : fallbackAreasForImprovement;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Insights</Text>
        <Text style={styles.description}>Analysis based on recent rounds</Text>
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader2 width={24} height={24} color="#10B981" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}. Showing sample data instead.
            </Text>
          </View>
        ) : (
          <>
            {isUsingFallbackData && (
              <View style={styles.alert}>
                <AlertCircle width={16} height={16} color="#F59E0B" />
                <Text style={styles.alertText}>
                  Not enough round data to generate insights. Play more rounds to see personalized analysis.
                </Text>
              </View>
            )}
            
            <View style={styles.insightSection}>
              <Text style={styles.sectionTitle}>Strong Performance Areas</Text>
              <View style={styles.insightList}>
                {displayStrongPoints.map((point, index) => (
                  <Text key={`strength-${index}`} style={styles.insightItem}>
                    • {point.description}
                  </Text>
                ))}
              </View>
            </View>
            
            <View style={styles.insightSection}>
              <Text style={styles.improvementTitle}>Areas for Focus</Text>
              <View style={styles.insightList}>
                {displayAreasForImprovement.map((point, index) => (
                  <Text key={`improvement-${index}`} style={styles.insightItem}>
                    • {point.description}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1F2C',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.2)',
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
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginBottom: 16,
  },
  alertText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 8,
    flex: 1,
  },
  insightSection: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC300',
    marginBottom: 8,
  },
  insightList: {
    gap: 8,
  },
  insightItem: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default PerformanceInsights;
