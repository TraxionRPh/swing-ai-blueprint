import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <Search size={16} color="#6B7280" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search courses by name, city or state..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  icon: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  input: {
    height: 44,
    paddingLeft: 40,
    paddingRight: 12,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
});
