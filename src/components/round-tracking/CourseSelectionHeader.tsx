import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CourseSelectionHeaderProps {
  title?: string;
  subtitle?: string;
}

export const CourseSelectionHeader = ({
  title = "Course Selection",
  subtitle = "Select a course to track your round",
}: CourseSelectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontSize: 24, // equivalent to text-2xl
    fontWeight: "700", // equivalent to font-bold
    letterSpacing: -0.5, // approximates tracking-tight
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666", // muted-foreground
    marginTop: 4,
  },
});
