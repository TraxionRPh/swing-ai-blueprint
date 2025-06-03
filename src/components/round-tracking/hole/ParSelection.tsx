import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ParSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const ParSelection: React.FC<ParSelectionProps> = ({
  value,
  onChange,
}) => {
  const options = ["3", "4", "5"];

  return (
    <View>
      {/* Label */}
      <Text style={styles.label}>Par</Text>

      {/* Toggle buttons row */}
      <View style={styles.toggleRow}>
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.toggleItem,
                isSelected ? styles.toggleItemSelected : styles.toggleItemUnselected,
              ]}
              onPress={() => onChange(opt)}
            >
              <Text
                style={[
                  styles.toggleText,
                  isSelected ? styles.toggleTextSelected : styles.toggleTextUnselected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

type Styles = {
  label: TextStyle;
  toggleRow: ViewStyle;
  toggleItem: ViewStyle;
  toggleItemSelected: ViewStyle;
  toggleItemUnselected: ViewStyle;
  toggleText: TextStyle;
  toggleTextSelected: TextStyle;
  toggleTextUnselected: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  label: {
    fontSize: 14,
    color: "#6B7280", // “text-muted-foreground”
    marginBottom: 4,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleItem: {
    width: 48,         // approx. “w-12”
    height: 32,        // approx. “h-8”
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,    // space between buttons
  },
  toggleItemSelected: {
    backgroundColor: "#3182CE",  // filled when selected
    borderColor: "#3182CE",      // same color for outline
  },
  toggleItemUnselected: {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB",      // light gray outline
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleTextSelected: {
    color: "#FFFFFF",
  },
  toggleTextUnselected: {
    color: "#374151", // dark gray text
  },
});
