// Update this page (the content is just a fallback if you fail to update the page)

import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

const Index: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Your Blank App</Text>
        <Text style={styles.subtitle}>
          Start building your amazing project here!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // gray-100
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827", // almost-black
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280", // gray-600
    textAlign: "center",
  },
});
