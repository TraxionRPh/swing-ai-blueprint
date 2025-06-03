import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PlanDurationSelectorProps {
  duration: string;
  onChange: (value: string) => void;
}

export const PlanDurationSelector = ({
  duration,
  onChange,
}: PlanDurationSelectorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Plan Duration</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => onChange("1")}
        >
          <View
            style={[
              styles.radioCircle,
              duration === "1" && styles.radioSelected,
            ]}
          />
          <Text style={styles.optionLabel}>1 Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => onChange("3")}
        >
          <View
            style={[
              styles.radioCircle,
              duration === "3" && styles.radioSelected,
            ]}
          />
          <Text style={styles.optionLabel}>3 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => onChange("5")}
        >
          <View
            style={[
              styles.radioCircle,
              duration === "5" && styles.radioSelected,
            ]}
          />
          <Text style={styles.optionLabel}>5 Days</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#777",
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  optionLabel: {
    fontSize: 16,
  },
});
