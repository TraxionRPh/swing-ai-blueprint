// DropdownMenu.native.tsx
import React, { useState, useContext, useRef, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  LayoutChangeEvent,
} from "react-native";
import { Check, Circle, ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";

// Types for menu items
interface DropdownMenuItemProps {
  label: string;
  onPress?: () => void;
  inset?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  checked: boolean;
}

interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  checked: boolean;
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
}

interface DropdownMenuContentProps {
  children: ReactNode[];
  visible: boolean;
  onClose: () => void;
  anchorLayout: { x: number; y: number; width: number; height: number } | null;
}

// Context to manage menu visibility
const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

// Root component managing open state
const DropdownMenu: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// Trigger that opens the menu on press
const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children }) => {
  const { setOpen } = useContext(DropdownMenuContext);
  const [anchorLayout, setAnchorLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  // Measure trigger position
  const measureAnchor = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setAnchorLayout({ x, y, width, height });
      });
    }
  };

  return (
    <TouchableOpacity
      ref={triggerRef}
      onPress={() => {
        measureAnchor();
        setOpen(true);
      }}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

// Content displayed in a Modal
const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  visible,
  onClose,
  anchorLayout,
}) => {
  if (!anchorLayout) return null;
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.menuContainer,
          {
            top: anchorLayout.y + anchorLayout.height + 4,
            left: anchorLayout.x,
          },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
};

// Basic menu item
const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  label,
  onPress,
  inset = false,
  disabled = false,
  shortcut,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.itemContainer,
      inset && styles.itemInset,
      disabled && styles.itemDisabled,
    ]}
    activeOpacity={0.6}
  >
    <Text style={[styles.itemLabel, disabled && styles.labelDisabled]}>
      {label}
    </Text>
    {shortcut && <Text style={styles.shortcut}>{shortcut}</Text>}
  </TouchableOpacity>
);

// Checkbox menu item
const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({
  label,
  onPress,
  checked,
  inset = false,
  disabled = false,
  shortcut,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.itemContainer,
      inset && styles.itemInset,
      disabled && styles.itemDisabled,
    ]}
    activeOpacity={0.6}
  >
    <View style={styles.iconContainer}>
      {checked && <Check size={16} color="#111827" />}
    </View>
    <Text style={[styles.itemLabel, disabled && styles.labelDisabled]}>
      {label}
    </Text>
    {shortcut && <Text style={styles.shortcut}>{shortcut}</Text>}
  </TouchableOpacity>
);

// Radio menu item
const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = ({
  label,
  onPress,
  checked,
  inset = false,
  disabled = false,
  shortcut,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.itemContainer,
      inset && styles.itemInset,
      disabled && styles.itemDisabled,
    ]}
    activeOpacity={0.6}
  >
    <View style={styles.iconContainer}>
      {checked && <Circle size={12} color="#111827" />}
    </View>
    <Text style={[styles.itemLabel, disabled && styles.labelDisabled]}>
      {label}
    </Text>
    {shortcut && <Text style={styles.shortcut}>{shortcut}</Text>}
  </TouchableOpacity>
);

// Label (non-interactive)
const DropdownMenuLabel: React.FC<{ label: string; inset?: boolean }> = ({
  label,
  inset = false,
}) => (
  <View style={[styles.labelContainer, inset && styles.itemInset]}>
    <Text style={styles.labelText}>{label}</Text>
  </View>
);

// Separator line
const DropdownMenuSeparator: React.FC = () => (
  <View style={styles.separator} />
);

// Submenu trigger (opens nested menu)
const DropdownMenuSubTrigger: React.FC<DropdownMenuItemProps & { children: ReactNode }> = ({
  label,
  children,
  inset = false,
  disabled = false,
}) => {
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [submenuAnchor, setSubmenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  const measureAnchor = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setSubmenuAnchor({ x: x + width, y, width, height });
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={() => {
          if (!disabled) {
            measureAnchor();
            setSubmenuVisible(true);
          }
        }}
        disabled={disabled}
        style={[
          styles.itemContainer,
          inset && styles.itemInset,
          disabled && styles.itemDisabled,
        ]}
        activeOpacity={0.6}
      >
        <Text style={[styles.itemLabel, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        <ChevronRight size={16} color="#6B7280" style={styles.chevron} />
      </TouchableOpacity>
      {submenuAnchor && (
        <DropdownMenuContent
          visible={submenuVisible}
          onClose={() => setSubmenuVisible(false)}
          anchorLayout={submenuAnchor}
        >
          {React.Children.map(children, (child) => child)}
        </DropdownMenuContent>
      )}
    </>
  );
};

// Submenu content (nested menu)
const DropdownMenuSubContent = DropdownMenuContent;

// Root exports
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 160,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemInset: {
    paddingLeft: 24,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  labelContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
    marginHorizontal: 8,
  },
  iconContainer: {
    position: "absolute",
    left: 12,
    top: 8,
  },
  shortcut: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});
