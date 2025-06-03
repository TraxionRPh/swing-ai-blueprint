// SidebarTrigger.native.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, View, AccessibilityRole } from "react-native";
import { PanelLeft } from "lucide-react-native";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils"; // if you have a utility for combining styles; otherwise remove

interface SidebarTriggerProps {
  style?: object;
  onPress?: () => void;
}

export const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ style, onPress }) => {
  const { toggleSidebar } = useSidebar();

  const handlePress = () => {
    onPress?.();
    toggleSidebar();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel="Toggle Sidebar"
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <PanelLeft size={24} color="#111827" />
      {/* sr-only text is not needed in RN; accessibilityLabel suffices */}
    </TouchableOpacity>
  );
};

SidebarTrigger.displayName = "SidebarTrigger";

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
