import React from "react";
import { View, Text, Switch, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Bell, Calendar, Brain } from "lucide-react-native";
import { useNotifications } from "@/hooks/useNotifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      {/* Card Container */}
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notification Preferences</Text>
          <Text style={styles.description}>
            Choose which notifications you'd like to receive
          </Text>
        </View>

        {/* Card Content */}
        <View style={styles.content}>
          {/* Practice Reminders Row */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color="#007AFF" />
              <Text style={styles.label}>Practice Reminders</Text>
            </View>
            <Switch
              value={preferences.practice_reminders}
              onValueChange={(checked) =>
                updatePreferences({ practice_reminders: checked })
              }
            />
          </View>

          {/* Round Completion Reminders Row */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Calendar size={20} color="#007AFF" />
              <Text style={styles.label}>Round Completion Reminders</Text>
            </View>
            <Switch
              value={preferences.round_completion_reminders}
              onValueChange={(checked) =>
                updatePreferences({ round_completion_reminders: checked })
              }
            />
          </View>

          {/* AI Insights Row */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Brain size={20} color="#007AFF" />
              <Text style={styles.label}>AI Insights</Text>
            </View>
            <Switch
              value={preferences.ai_insights}
              onValueChange={(checked) =>
                updatePreferences({ ai_insights: checked })
              }
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  card: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#fff",
    borderRadius: 8,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize:  sixteen,
    marginLeft:  eight,
    color: "#333",
  },
});
