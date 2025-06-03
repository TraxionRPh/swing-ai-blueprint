import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type AlertVariant = "default" | "destructive" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "default",
  children,
}) => {
  return <View style={[styles.alertBase, styles[variant]]}>{children}</View>;
};

interface AlertTitleProps {
  children: React.ReactNode;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ children }) => {
  return <Text style={styles.alertTitle}>{children}</Text>;
};

interface AlertDescriptionProps {
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
}) => {
  return <Text style={styles.alertDescription}>{children}</Text>;
};

type Styles = {
  alertBase: ViewStyle;
  default: ViewStyle;
  destructive: ViewStyle;
  warning: ViewStyle;
  alertTitle: TextStyle;
  alertDescription: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Base container for all variants
  alertBase: {
    position: "relative",
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    padding: 16,
  },

  // "default" variant: white background, gray‐200 border, dark text
  default: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB", // gray‐200
  },

  // "destructive" variant: very light red background, red border, red text
  destructive: {
    backgroundColor: "#FEF2F2", // red‐50
    borderColor: "#FCA5A5", // red‐300
  },

  // "warning" variant: very light amber background, amber border, amber text
  warning: {
    backgroundColor: "#FFFBEB", // amber‐50
    borderColor: "#FDE68A", // amber‐300
  },

  // Title text (maps to <h5 class="mb-1 font-medium leading-none tracking-tight">)
  alertTitle: {
    marginBottom: 4,
    fontSize: 16, // approximately tailwind text-lg
    fontWeight: "600",
    color: "#111827", // gray‐900
  },

  alertDescription: {
    fontSize: 14, // tailwind text-sm
    color: "#4B5563", // gray‐600
    lineHeight: 20, // relaxed leading
  },
});
