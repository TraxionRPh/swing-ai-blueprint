import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps {
  /**
   * Controls the visual variant of the badge.
   * @default "default"
   */
  variant?: BadgeVariant;

  /**
   * Any valid ReactNode(s) to display inside the badge.
   */
  children: React.ReactNode;

  /**
   * Additional style to apply to the badge container.
   */
  style?: ViewStyle;
}

/**
 * A small pill‐shaped label to highlight status, categories, etc.
 * 
 * Usage:
 *   <Badge>New</Badge>
 *   <Badge variant="destructive">Error</Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  style,
}) => {
  // Determine the styles for the container and text based on variant
  const containerStyles = [
    styles.baseContainer,
    styles[`${variant}Container` as keyof typeof styles],
    style,
  ];
  const textStyles = [styles.baseText, styles[`${variant}Text` as keyof typeof styles]];

  return (
    <View style={containerStyles}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

type Styles = {
  baseContainer: ViewStyle;
  defaultContainer: ViewStyle;
  secondaryContainer: ViewStyle;
  destructiveContainer: ViewStyle;
  outlineContainer: ViewStyle;
  baseText: TextStyle;
  defaultText: TextStyle;
  secondaryText: TextStyle;
  destructiveText: TextStyle;
  outlineText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Common container styles for all badges
  baseContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // shrink to content width
    borderRadius: 999, // Fully rounded
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  // Default variant: blue background, white text, no visible border
  defaultContainer: {
    backgroundColor: "#3182CE", // primary blue
    borderColor: "transparent",
  },
  defaultText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Secondary variant: gray background, white text, no visible border
  secondaryContainer: {
    backgroundColor: "#6B7280", // gray-500
    borderColor: "transparent",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Destructive variant: light red background, red border, white text
  destructiveContainer: {
    backgroundColor: "#FEE2E2", // red-100
    borderColor: "#EF4444", // red-500
  },
  destructiveText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },

  // Outline variant: transparent background, gray border, dark text
  outlineContainer: {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB", // gray-300
  },
  outlineText: {
    color: "#111827", // gray-900
    fontSize: 12,
    fontWeight: "600",
  },
});
