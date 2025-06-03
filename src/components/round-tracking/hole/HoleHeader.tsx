import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HoleNavigation } from "./HoleNavigation";
import { ParSelection } from "./ParSelection";

interface HoleHeaderProps {
  currentHole: number;
  holeCount: number;
  par: number;
  onParChange: (value: string) => void;
  goToPreviousHole: () => void;
}

export const HoleHeader: React.FC<HoleHeaderProps> = ({
  currentHole,
  holeCount,
  par,
  onParChange,
  goToPreviousHole,
}) => {
  return (
    <View style={styles.container}>
      {/* Top row: "Hole X" + navigation */}
      <View style={styles.row}>
        <Text style={styles.heading}>Hole {currentHole}</Text>
        <HoleNavigation
          currentHole={currentHole}
          holeCount={holeCount}
          goToPreviousHole={goToPreviousHole}
        />
      </View>

      {/* Par selection */}
      <View>
        <Text style={styles.label}>Par</Text>
        <ParSelection
          value={par.toString()}
          onChange={onParChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginBottom: 16, // spacing between header and next element
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12, // gap between title/navigation and par block
  },
  heading: {
    fontSize: 20,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#4A5568",
  },
});
