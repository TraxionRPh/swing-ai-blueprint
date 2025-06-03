import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Picker,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

interface CourseBasicInfoData {
  name: string;
  city: string;
  state: string;
  totalPar: string;
}

interface CourseBasicInfoFormProps {
  onSubmit: (data: CourseBasicInfoData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CourseBasicInfoForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
}: CourseBasicInfoFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseBasicInfoData>({
    defaultValues: {
      name: "",
      city: "",
      state: "",
      totalPar: "",
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Course Name Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Course Name</Text>
        <Controller
          control={control}
          name="name"
          rules={{ required: "Course name is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter course name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}
      </View>

      {/* City Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>City</Text>
        <Controller
          control={control}
          name="city"
          rules={{ required: "City is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="Enter city"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.city && (
          <Text style={styles.errorText}>{errors.city.message}</Text>
        )}
      </View>

      {/* State Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>State</Text>
        <Controller
          control={control}
          name="state"
          rules={{ required: "State is required" }}
          render={({ field: { onChange, value } }) => (
            <View
              style={[
                styles.pickerContainer,
                errors.state && styles.inputError,
              ]}
            >
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select State" value="" />
                {US_STATES.map((stateAbbrev) => (
                  <Picker.Item
                    key={stateAbbrev}
                    label={stateAbbrev}
                    value={stateAbbrev}
                  />
                ))}
              </Picker>
            </View>
          )}
        />
        {errors.state && (
          <Text style={styles.errorText}>{errors.state.message}</Text>
        )}
      </View>

      {/* Total Par Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Total Par</Text>
        <Controller
          control={control}
          name="totalPar"
          rules={{
            required: "Total par is required",
            validate: (value) => {
              const numValue = parseInt(value, 10);
              return (
                (numValue > 0 && numValue < 100) ||
                "Invalid par value (must be between 1 and 99)"
              );
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.totalPar && styles.inputError]}
              placeholder="Enter total par (e.g., 72)"
              keyboardType="numeric"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.totalPar && (
          <Text style={styles.errorText}>{errors.totalPar.message}</Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="Cancel" onPress={onCancel} disabled={isSubmitting} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title={isSubmitting ? "Creating..." : "Next: Add Tees"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#E55353",
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: "#E55353",
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  picker: {
    height: 44,
    width: "100%",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  buttonWrapper: {
    marginLeft: 12,
  },
});
