import React from "react";
import {
  View,
  Text,
  TextInput,
  Switch as RNSwitch,
  StyleSheet,
} from "react-native";

type HoleData = {
  distance: string | number;
  score: string | number;
  putts: string | number;
  fairwayHit: boolean;
  greenInRegulation: boolean;
};

interface HoleInputFormProps {
  holeData: HoleData;
  handleDistanceChange: (value: string) => void;
  handleScoreChange: (value: string) => void;
  handlePuttsChange: (value: string) => void;
  handleInputChange: (field: keyof HoleData, value: any) => void;
}

/**
 * NOTE: The original web handlers took a React.ChangeEvent<HTMLInputElement>.
 * In React Native, TextInput’s onChangeText gives you the new text directly.
 * So we change the signatures above accordingly.
 */
export const HoleInputForm: React.FC<HoleInputFormProps> = ({
  holeData,
  handleDistanceChange,
  handleScoreChange,
  handlePuttsChange,
  handleInputChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Yardage Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Distance (yards)</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={holeData.distance?.toString() || ""}
          onChangeText={handleDistanceChange}
          placeholder="Enter distance"
        />
      </View>

      {/* Score Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Score</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={holeData.score?.toString() || ""}
          onChangeText={handleScoreChange}
          placeholder="Enter score"
        />
      </View>

      {/* Putts Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Putts</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={holeData.putts?.toString() || ""}
          onChangeText={handlePuttsChange}
          placeholder="Enter putts"
        />
      </View>

      {/* Fairway and Green Regulation */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleContainer}>
          <RNSwitch
            value={holeData.fairwayHit}
            onValueChange={(val) => handleInputChange("fairwayHit", val)}
          />
          <Text style={styles.toggleLabel}>Fairway Hit</Text>
        </View>

        <View style={styles.toggleContainer}>
          <RNSwitch
            value={holeData.greenInRegulation}
            onValueChange={(val) =>
              handleInputChange("greenInRegulation", val)
            }
          />
          <Text style={styles.toggleLabel}>Green in Regulation</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 16, // RN 0.71+ supports gap; if older RN, use marginBottom on each field
    paddingVertical: 8,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
});
