// Select.native.tsx
import React, { useState, useRef, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  LayoutChangeEvent,
  SafeAreaView,
} from "react-native";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface SelectProps<T> {
  value: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  children: ReactNode; // Typically SelectGroup / SelectItem components
}

interface SelectTriggerProps {
  label: string;
  disabled?: boolean;
}

interface SelectContentProps<T> {
  visible: boolean;
  onClose: () => void;
  items: Array<{ label: string; value: T; disabled?: boolean }>;
  selectedValue: T | null;
  onSelect: (value: T) => void;
  anchorLayout: { x: number; y: number; width: number; height: number } | null;
}

interface SelectItemProps<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

export function Select<T>({
  value,
  onValueChange,
  placeholder = "Select...",
  children,
}: SelectProps<T>) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchorLayout, setAnchorLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  // Extract items from children (expecting <SelectItem> components)
  const items: Array<{ label: string; value: T; disabled?: boolean }> = [];
  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement<SelectItemProps<T>>(child) &&
      child.type === SelectItem
    ) {
      const { label, value: val, disabled } = child.props as SelectItemProps<T>;
      items.push({ label, value: val, disabled });
    }
  });

  const measureAnchor = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setAnchorLayout({ x, y, width, height });
      });
    }
  };

  const handleOpen = () => {
    measureAnchor();
    setMenuVisible(true);
  };

  const handleClose = () => {
    setMenuVisible(false);
  };

  const selectedLabel =
    items.find((item) => item.value === value)?.label || placeholder;

  return (
    <SafeAreaView>
      <TouchableOpacity
        ref={triggerRef}
        style={styles.triggerButton}
        onPress={handleOpen}
      >
        <Text style={[styles.triggerText, value ? styles.hasValue : styles.placeholderText]}>
          {selectedLabel}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      <SelectContent
        visible={menuVisible}
        onClose={handleClose}
        items={items}
        selectedValue={value}
        onSelect={(val) => {
          onValueChange(val);
          handleClose();
        }}
        anchorLayout={anchorLayout}
      />
    </SafeAreaView>
  );
}

function SelectContent<T>({
  visible,
  onClose,
  items,
  selectedValue,
  onSelect,
  anchorLayout,
}: SelectContentProps<T>) {
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to selected index if exists
    if (visible && selectedValue !== null) {
      const index = items.findIndex((item) => item.value === selectedValue);
      if (index >= 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index, animated: true });
        }, 100);
      }
    }
  }, [visible, selectedValue, items]);

  if (!anchorLayout) return null;

  const { width: windowWidth } = anchorLayout; // approximate width
  const left = anchorLayout.x;
  const top = anchorLayout.y + anchorLayout.height + 4;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
      <View style={[styles.menuContainer, { top, left, minWidth: windowWidth }]}>
        <SelectScrollUpButton listRef={listRef} items={items} />
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={item.disabled}
              style={[
                styles.itemContainer,
                item.disabled && styles.itemDisabled,
              ]}
              onPress={() => onSelect(item.value)}
            >
              {selectedValue === item.value && (
                <Check size={18} color="#111827" style={styles.iconIndicator} />
              )}
              <Text
                style={[
                  styles.itemText,
                  item.disabled && styles.textDisabled,
                  selectedValue === item.value && styles.textSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <SelectScrollDownButton listRef={listRef} items={items} />
      </View>
    </Modal>
  );
}

interface ScrollButtonProps<T> {
  listRef: React.RefObject<FlatList>;
  items: Array<{ label: string; value: T; disabled?: boolean }>;
}

const SelectScrollUpButton = <T,>({ listRef, items }: ScrollButtonProps<T>) => {
  const handlePress = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  return (
    <TouchableOpacity style={styles.scrollButton} onPress={handlePress}>
      <ChevronUp size={20} color="#6B7280" />
    </TouchableOpacity>
  );
};

const SelectScrollDownButton = <T,>({ listRef, items }: ScrollButtonProps<T>) => {
  const handlePress = () => {
    listRef.current?.scrollToOffset({ offset: items.length * 40, animated: true });
  };
  return (
    <TouchableOpacity style={styles.scrollButton} onPress={handlePress}>
      <ChevronDown size={20} color="#6B7280" />
    </TouchableOpacity>
  );
};

export function SelectItem<T>({ label, value, disabled }: SelectItemProps<T>) {
  // Placeholder: actual rendering happens in SelectContent
  return null;
}

export function SelectSeparator() {
  return <View style={styles.separator} />;
}

export function SelectLabel({ label }: { label: string }) {
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  placeholderText: {
    color: "#6B7280",
  },
  hasValue: {
    color: "#111827",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: 300,
  },
  scrollButton: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: 4,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 12,
  },
  iconIndicator: {
    marginRight: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#111827",
  },
  textSelected: {
    fontWeight: "600",
  },
  itemDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: "#9CA3AF",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
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
});
