import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

interface TeeData {
  name: string;
  color: string;
  courseRating: string;
  slopeRating: string;
  totalYards: string;
}

interface TeesFormProps {
  onTeesSubmit: (tees: TeeData[]) => Promise<boolean | void> | void;
  courseId?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const TeesForm: React.FC<TeesFormProps> = ({
  onTeesSubmit,
  isSubmitting = false,
  onCancel,
}) => {
  const [tees, setTees] = useState<TeeData[]>([
    { name: "", color: "", courseRating: "", slopeRating: "", totalYards: "" },
  ]);

  const addTee = () => {
    setTees((prev) => [
      ...prev,
      { name: "", color: "", courseRating: "", slopeRating: "", totalYards: "" },
    ]);
  };

  const removeTee = (index: number) => {
    setTees((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTee = (index: number, field: keyof TeeData, value: string) => {
    setTees((prev) => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const validateTees = (): boolean => {
    // 1) Check for any empty required field
    const hasEmptyRequired = tees.some(
      (t) =>
        !t.name.trim() ||
        !t.color.trim() ||
        !t.courseRating.trim() ||
        !t.slopeRating.trim() ||
        !t.totalYards.trim()
    );
    if (hasEmptyRequired) {
      Alert.alert(
        "Missing information",
        "Please fill in all fields for each tee set."
      );
      return false;
    }

    // 2) Numeric‐range checks
    const hasInvalid = tees.some((t) => {
      const cr = parseFloat(t.courseRating);
      const sr = parseInt(t.slopeRating, 10);
      const ty = parseInt(t.totalYards, 10);

      return (
        isNaN(cr) ||
        isNaN(sr) ||
        isNaN(ty) ||
        sr < 55 ||
        sr > 155 // slope must be 55–155
      );
    });

    if (hasInvalid) {
      Alert.alert(
        "Invalid ratings",
        "Please enter valid numbers for course rating, slope rating (55–155), and total yards."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateTees()) {
      onTeesSubmit(tees);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Outer container */}
      <View style={styles.container}>
        {tees.map((tee, index) => (
          <View
            key={index}
            style={[
              styles.teeCard,
              index % 2 === 0 ? styles.evenBackground : styles.oddBackground,
            ]}
          >
            {/* Header with title + optional Remove button */}
            <View style={styles.headerRow}>
              <Text style={styles.heading}>Tee Set {index + 1}</Text>
              {tees.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTee(index)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Grid of inputs */}
            <View style={styles.inputsGrid}>
              {/* Tee Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tee Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={tee.name}
                  placeholder="e.g., Championship"
                  onChangeText={(text) => updateTee(index, "name", text)}
                  editable={!isSubmitting}
                />
              </View>

              {/* Color */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.textInput}
                  value={tee.color}
                  placeholder="e.g., Blue"
                  onChangeText={(text) => updateTee(index, "color", text)}
                  editable={!isSubmitting}
                />
              </View>

              {/* Course Rating */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Course Rating</Text>
                <TextInput
                  style={styles.textInput}
                  value={tee.courseRating}
                  placeholder="72.4"
                  keyboardType="decimal-pad"
                  onChangeText={(text) =>
                    updateTee(index, "courseRating", text)
                  }
                  editable={!isSubmitting}
                />
              </View>

              {/* Slope Rating */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Slope Rating</Text>
                <TextInput
                  style={styles.textInput}
                  value={tee.slopeRating}
                  placeholder="133"
                  keyboardType="number-pad"
                  onChangeText={(text) =>
                    updateTee(index, "slopeRating", text)
                  }
                  editable={!isSubmitting}
                />
              </View>

              {/* Total Yards */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Yards</Text>
                <TextInput
                  style={styles.textInput}
                  value={tee.totalYards}
                  placeholder="7200"
                  keyboardType="number-pad"
                  onChangeText={(text) =>
                    updateTee(index, "totalYards", text)
                  }
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Footer row: Add Another Tee + Cancel/Save */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addTee}
            disabled={isSubmitting}
          >
            <Text style={styles.addButtonText}>+ Add Another Tee</Text>
          </TouchableOpacity>

          <View style={styles.rightButtons}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.footerButton, styles.cancelButton]}
                onPress={onCancel}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.footerButton,
                isSubmitting ? styles.disabledButton : styles.saveButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Saving..." : "Save Tees"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  teeCard: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  evenBackground: {
    backgroundColor: "#FFFFFF",
  },
  oddBackground: {
    backgroundColor: "#F5F5F5",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: "#E53E3E", // red
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
  inputsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputGroup: {
    width: "48%",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#3182CE",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "#3182CE",
    fontSize: 16,
    fontWeight: "500",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#A0AEC0",
    backgroundColor: "#F7FAFC",
  },
  cancelButtonText: {
    color: "#4A5568",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#3182CE",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#CBD5E0",
  },
});
