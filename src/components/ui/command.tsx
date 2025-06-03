import React, { useState, ReactNode, forwardRef, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Search, ChevronRight } from "lucide-react-native";

//
// CommandContext: share search text and selection if needed (optional)
//
const CommandContext = React.createContext<{
  searchText: string;
  setSearchText: (txt: string) => void;
} | null>(null);

function useCommand() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error("useCommand must be used within <Command>.");
  return ctx;
}

//
// Command: top‐level wrapper for the palette content
//
interface CommandProps {
  style?: ViewStyle;
  children: ReactNode;
}

export const Command = forwardRef<View, CommandProps>(({ style, children }, ref) => {
  const [searchText, setSearchText] = useState("");
  return (
    <CommandContext.Provider value={{ searchText, setSearchText }}>
      <View ref={ref} style={[styles.commandContainer, style]}>
        {children}
      </View>
    </CommandContext.Provider>
  );
});
Command.displayName = "Command";

//
// CommandDialog: wraps children in a Modal
//
interface CommandDialogProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

export const CommandDialog: React.FC<CommandDialogProps> = ({
  visible,
  onDismiss,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalContainer}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
CommandDialog.displayName = "CommandDialog";

//
// CommandInput: search field with icon
//
interface CommandInputProps {
  placeholder?: string;
}

export const CommandInput = forwardRef<TextInput, CommandInputProps>(
  ({ placeholder = "Type a command...", ...props }, ref) => {
    const { searchText, setSearchText } = useCommand();
    return (
      <View style={styles.inputWrapper}>
        <Search style={styles.searchIcon} />
        <TextInput
          ref={ref}
          style={styles.textInput}
          placeholder={placeholder}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#6B7280"
          underlineColorAndroid="transparent"
          {...props}
        />
      </View>
    );
  }
);
CommandInput.displayName = "CommandInput";

//
// CommandList: scrollable list of items
//
interface CommandListProps {
  style?: ViewStyle;
  children: ReactNode;
}

export const CommandList = forwardRef<ScrollView, CommandListProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        style={[styles.listContainer, style]}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
);
CommandList.displayName = "CommandList";

//
// CommandEmpty: shown when no results
//
interface CommandEmptyProps {
  children?: ReactNode;
}

export const CommandEmpty = forwardRef<View, CommandEmptyProps>(
  ({ children, ...props }, ref) => {
    return (
      <View ref={ref} style={styles.emptyContainer} {...props}>
        <Text style={styles.emptyText}>{children || "No results found."}</Text>
      </View>
    );
  }
);
CommandEmpty.displayName = "CommandEmpty";

//
// CommandGroup: groups items with a header
//
interface CommandGroupProps {
  heading: string;
  style?: ViewStyle;
  children: ReactNode;
}

export const CommandGroup = forwardRef<View, CommandGroupProps>(
  ({ heading, style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.groupContainer, style]} {...props}>
        <Text style={styles.groupHeading}>{heading}</Text>
        {children}
      </View>
    );
  }
);
CommandGroup.displayName = "CommandGroup";

//
// CommandSeparator: thin divider
//
interface CommandSeparatorProps {
  style?: ViewStyle;
}

export const CommandSeparator = forwardRef<View, CommandSeparatorProps>(
  ({ style, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.separator, style]} {...props} />
    );
  }
);
CommandSeparator.displayName = "CommandSeparator";

//
// CommandItem: a single selectable item
//
interface CommandItemProps {
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle;
  children: ReactNode;
}

export const CommandItem = forwardRef<View, CommandItemProps>(
  ({ onPress, disabled, selected, style, children, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.itemContainer,
          selected && styles.itemSelected,
          disabled && styles.itemDisabled,
          style,
        ]}
        activeOpacity={0.7}
        {...props}
      >
        <View style={styles.itemContent}>{children}</View>
        {selected && (
          <ChevronRight style={styles.itemChevron} />
        )}
      </TouchableOpacity>
    );
  }
);
CommandItem.displayName = "CommandItem";

//
// CommandShortcut: a right‐aligned shortcut label
//
interface CommandShortcutProps {
  children: ReactNode;
  style?: TextStyle;
}

export const CommandShortcut: React.FC<CommandShortcutProps> = ({
  children,
  style,
}) => {
  return <Text style={[styles.shortcutText, style]}>{children}</Text>;
};
CommandShortcut.displayName = "CommandShortcut";

//
// Styles
//
type Styles = {
  modalBackdrop: ViewStyle;
  modalContainer: ViewStyle;
  commandContainer: ViewStyle;
  inputWrapper: ViewStyle;
  searchIcon: ViewStyle;
  textInput: TextStyle;
  listContainer: ViewStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  groupContainer: ViewStyle;
  groupHeading: TextStyle;
  separator: ViewStyle;
  itemContainer: ViewStyle;
  itemSelected: ViewStyle;
  itemDisabled: ViewStyle;
  itemContent: ViewStyle;
  itemChevron: ViewStyle;
  shortcutText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Modal backdrop and centering
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },

  // Top-level Command container (equivalent to “flex h-full w-full flex-col overflow-hidden rounded-md bg-popover…”)
  commandContainer: {
    flexDirection: "column",
    backgroundColor: "#F9FAFB", // e.g. “bg-popover”
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  // Input wrapper with icon
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB", // border color
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
    color: "#6B7280", // muted icon color
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },

  // List container (scrollable)
  listContainer: {
    maxHeight: 300,
  },

  // Empty state
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },

  // Group heading and container
  groupContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  groupHeading: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
  },

  // Separator line
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
    marginHorizontal: 12,
  },

  // Each item
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  itemSelected: {
    backgroundColor: "#E0F2FE", // e.g. light accent background
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemChevron: {
    color: "#111827",
    fontSize: 16,
    marginLeft: 8,
  },

  // Shortcut text
  shortcutText: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: 1.5,
  },
});
