import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface RoundStatsProps {
  totalScore: number;
  totalPutts: number;
  fairwaysHit: number;
  greensInRegulation: number;
  totalHoles: number;
  parTotal: number;
  fairwayEligibleHoles: number;
  courseName: string;
  date: string;
}

export const RoundSummaryCard: React.FC<RoundStatsProps> = ({
  totalScore,
  totalPutts,
  fairwaysHit,
  greensInRegulation,
  totalHoles,
  parTotal,
  fairwayEligibleHoles,
  courseName,
  date,
}) => {
  const toPar = totalScore - parTotal;
  const puttsPerHole = (totalPutts / totalHoles).toFixed(1);
  const fairwayPct =
    fairwayEligibleHoles > 0
      ? Math.round((fairwaysHit / fairwayEligibleHoles) * 100)
      : 0;
  const girPct = Math.round((greensInRegulation / totalHoles) * 100);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Round Summary</Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Stats Grid: 2 columns */}
        <View style={styles.gridContainer}>
          {/* Total Score */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Score</Text>
            <Text style={styles.statValue}>{totalScore}</Text>
            <Text style={styles.statSubtext}>
              {toPar >= 0 ? "+" : ""}
              {toPar} to Par
            </Text>
          </View>

          {/* Total Putts */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Putts</Text>
            <Text style={styles.statValue}>{totalPutts}</Text>
            <Text style={styles.statSubtext}>{puttsPerHole} per hole</Text>
          </View>

          {/* Fairways Hit */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fairways Hit</Text>
            <Text style={styles.statValue}>{fairwaysHit}</Text>
            <Text style={styles.statSubtext}>{fairwayPct}%</Text>
          </View>

          {/* Greens in Regulation */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Greens in Reg.</Text>
            <Text style={styles.statValue}>{greensInRegulation}</Text>
            <Text style={styles.statSubtext}>{girPct}%</Text>
          </View>
        </View>

        {/* Course Name & Date */}
        <View style={styles.footer}>
          <Text style={styles.courseName}>{courseName}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>
    </View>
  );
};

type Styles = {
  card: ViewStyle;
  cardHeader: ViewStyle;
  cardTitle: TextStyle;
  cardContent: ViewStyle;
  gridContainer: ViewStyle;
  statCard: ViewStyle;
  statLabel: TextStyle;
  statValue: TextStyle;
  statSubtext: TextStyle;
  footer: ViewStyle;
  courseName: TextStyle;
  dateText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Card wrapper
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    margin: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // Android elevation
    elevation: 3,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardContent: {
    padding: 12,
  },

  // Grid container: wraps 4 stat cards, 2 per row
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8, // offset statCard’s horizontal margin
  },
  statCard: {
    width: "50%", // 2 cards per row
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 8,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280", // muted-foreground
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 14,
    color: "#374151",
  },

  // Footer (course name and date)
  footer: {
    alignItems: "center",
    marginTop: 16,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280", // muted-foreground
  },
});
