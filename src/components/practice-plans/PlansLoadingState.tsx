import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const PlansLoadingState = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.skeletonContent} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  skeletonTitle: {
    width: SCREEN_WIDTH * 0.75,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: SCREEN_WIDTH * 0.5,
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  skeletonContent: {
    width: "100%",
    height: 80,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
});
