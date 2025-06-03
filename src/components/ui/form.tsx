import React, { createContext, useContext, ReactNode, forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps
} from "react-native";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

//
// Re‐export FormProvider as Form
//
export const Form = FormProvider;

//
// Context and hook for the current field’s name
//
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue<any> | null>(null);

function useFormFieldContext<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>() {
  const ctx = useContext<FormFieldContextValue<TFieldValues, TName> | null>(FormFieldContext);
  if (!ctx) {
    throw new Error("useFormFieldContext must be used within a <FormField>");
  }
  return ctx;
}

//
// <FormField> wraps a React Hook Form <Controller> and provides the `name` in context
//
export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

//
// Context and hook for the current item’s unique ID
//
type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue | null>(null);

export function useFormItemContext() {
  const ctx = useContext(FormItemContext);
  if (!ctx) {
    throw new Error("useFormItemContext must be used within a <FormItem>");
  }
  return ctx;
}

//
// <FormItem> generates a unique ID for an input group and provides it in context
//
export const FormItem = forwardRef<View, { style?: ViewStyle; children: ReactNode }>(
  ({ style, children, ...props }, ref) => {
    // React.useId() works in RN >= 0.68; fallback to random string if needed
    const id = React.useId ? React.useId() : Math.random().toString(36).slice(2);

    return (
      <FormItemContext.Provider value={{ id }}>
        <View ref={ref} style={[styles.itemContainer, style]} {...props}>
          {children}
        </View>
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = "FormItem";

//
// Shared hook that pulls together field‐related IDs and error state
//
export function useFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>() {
  const { name } = useFormFieldContext<TFieldValues, TName>();
  const { id } = useFormItemContext();
  const { getFieldState, formState } = useFormContext<TFieldValues>();
  const fieldState = getFieldState(name, formState);

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: fieldState.error,
    isTouched: fieldState.isTouched,
    isDirty: fieldState.isDirty,
  };
}

//
// <FormLabel> renders a Text label and sets accessibilityLabelledBy on the input
//
export const FormLabel = forwardRef<Text, { style?: TextStyle; children: ReactNode }>(
  ({ style, children, ...props }, ref) => {
    const { error, formItemId } = useFormField<any, any>();
    return (
      <Text
        ref={ref}
        style={[styles.labelText, error && styles.labelError, style]}
        // The data‐testID can help link label and input in testing, but RN’s
        // accessibilityLabelledBy only works on Android for View/TextInput.
        accessibilityRole="label"
        accessibilityLabelledBy={formItemId}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
FormLabel.displayName = "FormLabel";

//
// <FormControl> clones its child (typically a TextInput) and injects
// accessibility props: accessibilityLabelledBy and accessibilityDescribedBy.
//
type FormControlProps = {
  children: React.ReactElement<TextInputProps>;
};

export const FormControl = forwardRef<TextInput, FormControlProps>(
  ({ children, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField<any, any>();

    // Build accessibilityDescribedBy: if there’s an error, include both description & message IDs
    const accessibilityDescribedBy = !error
      ? formDescriptionId
      : `${formDescriptionId} ${formMessageId}`;

    return React.cloneElement(children, {
      ref,
      // We set a testID equal to formItemId so that accessibilityLabelledBy works
      testID: formItemId,
      accessible: true,
      accessibilityLabelledBy: formItemId,
      accessibilityDescribedBy,
      accessibilityInvalid: !!error,
      ...props,
    });
  }
);
FormControl.displayName = "FormControl";

//
// <FormDescription> renders helper text under the input
//
export const FormDescription = forwardRef<Text, { style?: TextStyle; children: ReactNode }>(
  ({ style, children, ...props }, ref) => {
    const { formDescriptionId } = useFormField<any, any>();
    return (
      <Text ref={ref} style={[styles.descriptionText, style]} {...props}>
        {children}
      </Text>
    );
  }
);
FormDescription.displayName = "FormDescription";

//
// <FormMessage> renders validation error or custom children
//
export const FormMessage = forwardRef<Text, { style?: TextStyle; children?: ReactNode }>(
  ({ style, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField<any, any>();
    const body = error ? String(error.message) : children;
    if (!body) {
      return null;
    }
    return (
      <Text
        ref={ref}
        style={[styles.errorText, style]}
        testID={formMessageId}
        accessibilityLiveRegion="polite"
        {...props}
      >
        {body}
      </Text>
    );
  }
);
FormMessage.displayName = "FormMessage";

//
// Stylesheet
//
type Styles = {
  itemContainer: ViewStyle;
  labelText: TextStyle;
  labelError: TextStyle;
  descriptionText: TextStyle;
  errorText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Container for each form field (spacing between label, input, messages)
  itemContainer: {
    marginBottom: 16,
  },

  // Label text
  labelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  // If there’s an error, label turns red
  labelError: {
    color: "#B91C1C",
  },

  // Description/helper text
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // Error message text
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
    marginTop: 4,
    fontWeight: "500",
  },
});
