import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Drill } from "@/types/drill";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RecommendedDrillsCardProps {
  drills: Drill[];
}

export const RecommendedDrillsCard = ({ drills }: RecommendedDrillsCardProps) => {
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Recommended Drills</Text>
        <Text style={styles.cardDescription}>
          Practice these drills to address your specific issue
        </Text>
      </View>

      {/* Card Content */}
      <ScrollView
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
      >
        {drills.map((drill, i) => (
          <View key={i} style={styles.drillContainer}>
            {/* Title & Difficulty Badge */}
            <View style={styles.drillHeader}>
              <Text style={styles.drillTitle}>{drill.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{drill.difficulty}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.drillDescription}>{drill.description}</Text>

            {/* Focus Tags & Duration */}
            <View style={styles.drillFooter}>
              <View style={styles.focusTagsRow}>
                {drill.focus?.map((tag) => (
                  <View key={tag} style={styles.outlineBadge}>
                    <Text style={styles.outlineBadgeText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.durationText}>{drill.duration}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 12,
    marginHorizontal: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drillContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  drillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  drillTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  drillDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  drillFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  focusTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  outlineBadge: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  outlineBadgeText: {
    color: "#007AFF",
    fontSize: 12,
  },
  durationText: {
    fontSize: 12,
    color: "#888",
  },
});
