import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PlanTypeSelectorProps {
  planType: string;
  onChange: (value: string) => void;
}

export const PlanTypeSelector = ({
  planType,
  onChange,
}: PlanTypeSelectorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Plan Type</Text>

      <View style={styles.tabList}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            planType === "ai" && styles.tabItemSelected,
          ]}
          onPress={() => onChange("ai")}
        >
          <Text
            style={[
              styles.tabText,
              planType === "ai" && styles.tabTextSelected,
            ]}
          >
            AI-Generated
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            planType === "manual" && styles.tabItemSelected,
          ]}
          onPress={() => onChange("manual")}
        >
          <Text
            style={[
              styles.tabText,
              planType === "manual" && styles.tabTextSelected,
            ]}
          >
            Manual Selection
          </Text>
        </TouchableOpacity>
      </View>

      {planType === "ai" && (
        <Text style={styles.description}>
          Our AI will analyze your performance data and create a plan tailored
          to your needs.
        </Text>
      )}

      {planType === "manual" && (
        <Text style={styles.description}>
          Select specific drills and exercises to create your own custom practice
          plan.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  tabList: {
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  tabItemSelected: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
  },
  tabTextSelected: {
    color: "#fff",
    fontWeight: "500",
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
