import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { Loader2 } from "lucide-react-native";
import { RoundHeader } from "./RoundHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LoadingStateProps {
  message?: string;
  onBack?: () => void;
}

export const LoadingState = ({
  message = "Loading...",
  onBack,
}: LoadingStateProps) => {
  return (
    <View style={styles.container}>
      <RoundHeader
        title="Round Tracking"
        subtitle="Loading your round data"
        onBack={onBack}
      />

      <View style={styles.content}>
        <Loader2 size={32} color="#3B82F6" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize:  sixteen,
    color: "#6B7280",
    textAlign: "center",
  },
});
