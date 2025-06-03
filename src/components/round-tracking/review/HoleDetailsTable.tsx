import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { HoleData } from "@/types/round-tracking";
import { CheckCircle, AlertTriangle } from "lucide-react-native";

interface HoleDetailsTableProps {
  holeScores: HoleData[];
}

export const HoleDetailsTable: React.FC<HoleDetailsTableProps> = ({
  holeScores,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Hole by Hole Details</Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {holeScores.length > 0 ? (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View>
              {/* Table Header Row */}
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>Hole</Text>
                </View>
                <View style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>Par</Text>
                </View>
                <View style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>Score</Text>
                </View>
                <View style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>Putts</Text>
                </View>
                <View style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>Fairway</Text>
                </View>
                <View style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>GIR</Text>
                </View>
              </View>

              {/* Table Body Rows */}
              {holeScores.map((hole) => {
                const underPar = hole.score < hole.par;
                const overPar = hole.score > hole.par;

                return (
                  <View style={styles.row} key={hole.holeNumber}>
                    {/* Hole Number */}
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>
                        {hole.holeNumber}
                      </Text>
                    </View>

                    {/* Par */}
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>{hole.par}</Text>
                    </View>

                    {/* Score (colored if under/over par) */}
                    <View style={styles.cell}>
                      <Text
                        style={[
                          styles.cellText,
                          underPar
                            ? styles.underPar
                            : overPar
                            ? styles.overPar
                            : styles.evenPar,
                        ]}
                      >
                        {hole.score}
                      </Text>
                    </View>

                    {/* Putts */}
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>{hole.putts}</Text>
                    </View>

                    {/* Fairway */}
                    <View style={styles.cell}>
                      {hole.par > 3 ? (
                        hole.fairwayHit ? (
                          <CheckCircle size={16} color="#22C55E" />
                        ) : (
                          <Text style={styles.cellText}>-</Text>
                        )
                      ) : (
                        <Text style={styles.cellText}>N/A</Text>
                      )}
                    </View>

                    {/* GIR */}
                    <View style={styles.cell}>
                      {hole.greenInRegulation ? (
                        <CheckCircle size={16} color="#22C55E" />
                      ) : (
                        <Text style={styles.cellText}>-</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={40} color="#FBBF24" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              No hole scores found for this round.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

type Styles = {
  card: ViewStyle;
  cardHeader: ViewStyle;
  cardTitle: TextStyle;
  cardContent: ViewStyle;
  row: ViewStyle;
  headerRow: ViewStyle;
  cell: ViewStyle;
  headerCell: ViewStyle;
  headerText: TextStyle;
  cellText: TextStyle;
  underPar: TextStyle;
  overPar: TextStyle;
  evenPar: TextStyle;
  emptyContainer: ViewStyle;
  emptyIcon: ViewStyle;
  emptyText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Mimic a “Card” wrapper
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

  // Table row (both header and data rows)
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },
  headerRow: {
    backgroundColor: "#F3F4F6",
  },

  // Each “cell” container
  cell: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCell: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },

  // Header text style
  headerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },

  // Regular cell text
  cellText: {
    fontSize: 14,
    color: "#1F2937",
  },
  underPar: {
    color: "#22C55E", // green
    fontWeight: "600",
  },
  overPar: {
    color: "#DC2626", // red
    fontWeight: "600",
  },
  evenPar: {
    fontWeight: "600",
    color: "#1F2937",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
