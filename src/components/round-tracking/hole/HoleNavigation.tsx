import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

interface HoleNavigationProps {
  currentHole: number;
  holeCount: number;
  goToPreviousHole: () => void;
  goToNextHole?: () => void;
}

export const HoleNavigation: React.FC<HoleNavigationProps> = ({
  currentHole,
  holeCount,
  goToPreviousHole,
  goToNextHole,
}) => {
  const isNextDisabled = currentHole >= holeCount;

  return (
    <View style={styles.container}>
      {/* Left side is just a placeholder to keep spacing consistent (no Previous button here) */}
      <View style={styles.placeholder} />

      {/* Next Hole button */}
      {goToNextHole ? (
        <TouchableOpacity
          style={[
            styles.button,
            styles.outlineButton,
            isNextDisabled && styles.disabledButton,
          ]}
          onPress={goToNextHole}
          disabled={isNextDisabled}
        >
          <Text
            style={[
              styles.buttonText,
              styles.outlineButtonText,
              isNextDisabled && styles.disabledButtonText,
            ]}
          >
            Next Hole
          </Text>
          <ChevronRight
            size={16}
            style={[
              styles.icon,
              isNextDisabled && styles.disabledIcon,
            ]}
          />
        </TouchableOpacity>
      ) : (
        // If no goToNextHole provided, show a fixed-width view to maintain layout
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

type Styles = {
  container: ViewStyle;
  button: ViewStyle;
  outlineButton: ViewStyle;
  disabledButton: ViewStyle;
  buttonText: TextStyle;
  outlineButtonText: TextStyle;
  disabledButtonText: TextStyle;
  icon: TextStyle;
  disabledIcon: TextStyle;
  placeholder: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#3182CE", // adjust to your outline color
    backgroundColor: "transparent",
  },
  disabledButton: {
    borderColor: "#CBD5E0",
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  outlineButtonText: {
    color: "#3182CE",
  },
  disabledButtonText: {
    color: "#A0AEC0",
  },
  icon: {
    marginLeft: 4,
    color: "#3182CE",
  },
  disabledIcon: {
    color: "#A0AEC0",
  },
  placeholder: {
    width: 105, // same as your web “w-[105px]”
  },
});
