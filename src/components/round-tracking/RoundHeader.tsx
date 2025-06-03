import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";

interface RoundHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  hideBackButton?: boolean;
}

export const RoundHeader = ({
  title,
  subtitle,
  onBack,
  hideBackButton = false,
}: RoundHeaderProps) => {
  return (
    <View style={styles.container}>
      {!hideBackButton && onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontSize: 28, // equivalent to text-3xl
    fontWeight: "700", // equivalent to font-bold
    letterSpacing: -0.5, // approximates tracking-tight
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280", // muted-foreground
    marginTop: 4,
  },
});
