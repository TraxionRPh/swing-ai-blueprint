import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  forwardRef,
} from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { Dot } from "lucide-react-native"; // RN version of Dot icon

//
// Types
//
type SlotState = {
  char: string;
  isActive: boolean;
};

type OTPContextValue = {
  length: number;
  slots: SlotState[];
  focusIndex: number;
  setFocusIndex: (idx: number) => void;
  setCharAt: (idx: number, char: string) => void;
  disabled: boolean;
};

//
// Create Context
//
const OTPContext = createContext<OTPContextValue | null>(null);

function useOTPContext() {
  const ctx = useContext(OTPContext);
  if (!ctx) {
    throw new Error("useOTPContext must be used within <InputOTP>");
  }
  return ctx;
}

//
// <InputOTP>
// Props:
//   - length: number of digits/cells
//   - value?: string (controlled). If provided, use this. Otherwise, manage internal state.
//   - onChange?: (otp: string) => void
//   - disabled?: boolean
//   - style?: ViewStyle
//
interface InputOTPProps {
  length: number;
  value?: string;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const InputOTP: React.FC<InputOTPProps> = ({
  length,
  value,
  onChange,
  disabled = false,
  style,
  children, // Expecting children to be <InputOTPGroup> … but we can render children as‐is
}) => {
  // Internal state if uncontrolled
  const [internalValue, setInternalValue] = useState<string>(
    value?.slice(0, length).padEnd(length, "")
  );

  // When value prop changes (controlled), update internalValue
  useEffect(() => {
    if (typeof value === "string") {
      // pad or truncate to length
      const newVal = value.slice(0, length).padEnd(length, "");
      setInternalValue(newVal);
    }
  }, [value, length]);

  // Array of slot states
  const [slots, setSlots] = useState<SlotState[]>(
    Array.from({ length }, (_, i) => ({
      char: internalValue[i] || "",
      isActive: i === 0,
    }))
  );

  // Focus index state
  const [focusIndex, setFocusIndex] = useState(0);

  // Refs to each TextInput
  const inputRefs = useRef<Array<TextInput | null>>(Array(length).fill(null));

  // Helper to update a character at index
  const setCharAt = (idx: number, char: string) => {
    const newChars = (value !== undefined
      ? value.slice(0, length).padEnd(length, "")
      : internalValue
    )
      .split("")
      .slice(0, length);

    newChars[idx] = char;

    const newVal = newChars.join("");
    if (value === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  // Whenever internalValue changes, update slots
  useEffect(() => {
    setSlots((prev) =>
      prev.map((slot, i) => ({
        char: internalValue[i] || "",
        isActive: i === focusIndex,
      }))
    );
  }, [internalValue, focusIndex]);

  // Whenever focusIndex changes, ensure only that slot isActive
  useEffect(() => {
    setSlots((prev) =>
      prev.map((slot, i) => ({
        ...slot,
        isActive: i === focusIndex,
      }))
    );
    // Focus the appropriate TextInput
    const ref = inputRefs.current[focusIndex];
    if (ref && !disabled) {
      ref.focus();
    }
  }, [focusIndex, disabled]);

  // On mount, focus first slot if not disabled
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  // Shared context value
  const contextValue: OTPContextValue = {
    length,
    slots,
    focusIndex,
    setFocusIndex,
    setCharAt,
    disabled: !!disabled,
  };

  return (
    <OTPContext.Provider value={contextValue}>
      <View style={[styles.otpContainer, style]}>{children}</View>
    </OTPContext.Provider>
  );
};
InputOTP.displayName = "InputOTP";

//
// <InputOTPGroup>: lays out slots horizontally
//
interface InputOTPGroupProps {
  style?: ViewStyle;
  children: ReactNode;
}

export const InputOTPGroup = forwardRef<View, InputOTPGroupProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[styles.groupContainer, style]}
        {...props}
      >
        {children}
      </View>
    );
  }
);
InputOTPGroup.displayName = "InputOTPGroup";

//
// <InputOTPSlot>: a single box containing one character and an underlying TextInput
// Props: index: number (which slot index this is)
//
interface InputOTPSlotProps {
  index: number;
  style?: ViewStyle;
}

export const InputOTPSlot = forwardRef<TextInput, InputOTPSlotProps>(
  ({ index, style, ...props }, ref) => {
    const { slots, focusIndex, setFocusIndex, setCharAt, disabled } =
      useOTPContext();

    const slot = slots[index];
    const char = slot.char;
    const isActive = slot.isActive;

    // Handler when user types into this slot
    const onChangeText = (text: string) => {
      if (disabled) return;
      const digit = text.replace(/[^0-9]/g, "").slice(0, 1); // only numeric, 1 char
      setCharAt(index, digit);

      if (digit !== "" && index < slots.length - 1) {
        setFocusIndex(index + 1);
      }
    };

    // Handler for backspace: if empty, move to previous
    const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (disabled) return;
      if (e.nativeEvent.key === "Backspace") {
        if (char === "" && index > 0) {
          setFocusIndex(index - 1);
        } else {
          // Clear this slot
          setCharAt(index, "");
        }
      }
    };

    return (
      <View
        style={[
          styles.slotContainer,
          isActive && styles.slotActive,
          style,
        ]}
      >
        <TextInput
          ref={(r) => {
            inputRefSetter(r, index);
            if (ref && typeof ref !== "function") {
              (ref as React.MutableRefObject<TextInput | null>).current = r;
            }
          }}
          style={styles.slotInput}
          value={char}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          textAlign="center"
          placeholder=""
        />
        {/* Optionally show a custom caret when active and empty */}
        {isActive && char === "" && (
          <View style={styles.fakeCaretContainer} pointerEvents="none">
            <View style={styles.fakeCaret} />
          </View>
        )}
      </View>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

// Helper to set the correct ref in inputRefs array
const inputRefs: React.MutableRefObject<Array<TextInput | null>> = useRef<
  Array<TextInput | null>
>([]);

function inputRefSetter(ref: TextInput | null, idx: number) {
  inputRefs.current[idx] = ref;
}

//
// <InputOTPSeparator>: renders a Dot icon between slots
//
interface InputOTPSeparatorProps {
  style?: ViewStyle;
}

export const InputOTPSeparator = forwardRef<View, InputOTPSeparatorProps>(
  ({ style, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.separatorContainer, style]} {...props}>
        <Dot size={12} color="#6B7280" />
      </View>
    );
  }
);
InputOTPSeparator.displayName = "InputOTPSeparator";

//
// Styles
//
type Styles = {
  otpContainer: ViewStyle;
  groupContainer: ViewStyle;
  slotContainer: ViewStyle;
  slotActive: ViewStyle;
  slotInput: TextStyle;
  fakeCaretContainer: ViewStyle;
  fakeCaret: ViewStyle;
  separatorContainer: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  // Container for the entire OTP (wraps children)
  otpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Group: horizontal row with gap
  groupContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Slot: fixed size box with border
  slotContainer: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  // Active slot highlight
  slotActive: {
    borderColor: "#3182CE",
    borderWidth: 2,
  },
  // TextInput inside slot
  slotInput: {
    width: "100%",
    height: "100%",
    fontSize: 20,
    color: "#111827",
    padding: 0,
  },
  // Fake caret (vertical line) when slot is active and empty
  fakeCaretContainer: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: "50%",
    width: 1,
    backgroundColor: "#3182CE",
  },
  fakeCaret: {
    flex: 1,
    backgroundColor: "#3182CE",
    width: 1,
    borderRadius: 0.5,
  },
  // Separator container (just centers the icon)
  separatorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
