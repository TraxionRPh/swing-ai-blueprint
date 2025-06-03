import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Circle, Plus } from "lucide-react-native";

interface CourseTee {
  id: string;
  name: string;
  color?: string;
}

interface Course {
  course_tees?: CourseTee[];
}

interface TeeSelectionProps {
  selectedCourse: Course | null;
  selectedTeeId: string | null;
  onTeeSelect: (teeId: string) => void;
  onAddTee?: () => void;
}

export const TeeSelection = ({
  selectedCourse,
  selectedTeeId,
  onTeeSelect,
  onAddTee,
}: TeeSelectionProps) => {
  if (!selectedCourse || !selectedCourse.course_tees?.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Select Tee</Text>
        {onAddTee && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddTee}
            activeOpacity={0.7}
          >
            <Plus size={16} color="#2563EB" style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add Tee</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teesRow}
      >
        {selectedCourse.course_tees.map((tee) => {
          const colorLower = tee.color?.toLowerCase() || "";
          const isLightColor = ["white", "yellow", "gold", "beige"].includes(
            colorLower
          );
          const isSelected = selectedTeeId === tee.id;
          return (
            <TouchableOpacity
              key={tee.id}
              style={[
                styles.teeButton,
                isSelected && styles.selectedTeeButton,
              ]}
              onPress={() => onTeeSelect(tee.id)}
              activeOpacity={0.7}
            >
              <Circle
                size={ sixteen}
                color={tee.color || "#888"}
                fill={tee.color || "#888"}
                strokeWidth={isLightColor ? 1 : 0}
                style={styles.circleIcon}
              />
              <Text
                style={[
                  styles.teeText,
                  isSelected && styles.selectedTeeText,
                ]}
              >
                {tee.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize:  sixteen,
    fontWeight: "500",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  plusIcon: {
    marginRight:  four,
  },
  addButtonText: {
    fontSize:  fourteen,
    color: "#2563EB",
    fontWeight: "500",
  },
  teesRow: {
    flexDirection: "row",
  },
  teeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight:  eight,
    backgroundColor: "#fff",
  },
  selectedTeeButton: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  circleIcon: {
    marginRight:  eight,
  },
  teeText: {
    fontSize:  fourteen,
    color: "#111827",
  },
  selectedTeeText: {
    color: "#fff",
  },
});
