import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigate, useLocation } from "react-router-native";
import { useRound } from "@/context/round";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HoleCountSelectionProps {
  holeCount: number;
  setHoleCount: (count: number) => void;
}

export const HoleCountSelection = ({
  holeCount,
  setHoleCount,
}: HoleCountSelectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);
  const roundContext = useRound();

  // On first render, read URL to set initial hole count
  useEffect(() => {
    if (initialLoad) {
      if (location.pathname.includes("/9")) {
        setHoleCount(9);
        roundContext?.setHoleCount?.(9);
      } else if (location.pathname.includes("/18")) {
        setHoleCount(18);
        roundContext?.setHoleCount?.(18);
      }
      setInitialLoad(false);
    }
  }, [location.pathname, initialLoad, setHoleCount, roundContext]);

  const handleHoleCountChange = (value: "9" | "18") => {
    const newHoleCount = parseInt(value, 10);
    setHoleCount(newHoleCount);
    roundContext?.setHoleCount?.(newHoleCount);

    // Construct new route and replace without pushing a new entry
    const newUrl = value === "9" ? "/rounds/new/9" : "/rounds/new/18";
    navigate(newUrl, { replace: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Round Type</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleHoleCountChange("9")}
        >
          <View
            style={[
              styles.radioCircle,
              holeCount === 9 && styles.radioCircleSelected,
            ]}
          />
          <Text style={styles.optionLabel}>9 Holes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleHoleCountChange("18")}
        >
          <View
            style={[
              styles.radioCircle,
              holeCount === 18 && styles.radioCircleSelected,
            ]}
          />
          <Text style={styles.optionLabel}>18 Holes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  heading: {
    fontSize:  sixteen,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
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
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionLabel: {
    fontSize:  sixteen,
    color: "#333",
  },
});
