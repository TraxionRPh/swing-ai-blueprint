import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface RoundStatsSummaryProps {
  totalStrokes: number;
  totalPutts: number;
  fairwaysHit: number;
  totalFairways: number;
  greensInRegulation: number;
  totalGreens: number;
}

export const RoundStatsSummary: React.FC<RoundStatsSummaryProps> = ({
  totalStrokes,
  totalPutts,
  fairwaysHit,
  totalFairways,
  greensInRegulation,
  totalGreens,
}) => {
  const fairwayText = `${fairwaysHit}/${totalFairways}`;
  const girText = `${greensInRegulation}/${totalGreens}`;

  return (
    <View style={styles.container}>
      <StatCard title="Total Strokes" value={totalStrokes.toString()} />
      <StatCard title="Total Putts" value={totalPutts.toString()} />
      <StatCard title="FIR" value={fairwayText} />
      <StatCard title="GIR" value={girText} />
    </View>
  );
};

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

type Styles = {
  container: ViewStyle;
  card: ViewStyle;
  cardTitle: TextStyle;
  cardValue: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8, // offset the horizontal padding on children
  },
  card: {
    width: "50%",           // two cards per row
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 8,    // to create gap between cards
    marginBottom: 16,       // vertical gap between rows
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280", // muted-foreground
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
});
