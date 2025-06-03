// ContextMenu.native.tsx
import React, { useState, ReactNode } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { Check, Circle, ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";

// Types for menu items
interface ContextMenuItemProps {
  label: string;
  onPress?: () => void;
  inset?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  isChecked?: boolean;
  isRadio?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
}

interface ContextMenuContentProps {
  visible: boolean;
  onClose: () => void;
  items: ContextMenuItemProps[];
  style?: object;
}

// A basic ContextMenuContent using Modal
const ContextMenuContent: React.FC<ContextMenuContentProps> = ({
  visible,
  onClose,
  items,
  style,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.menuContainer, style]}>
        <FlatList
          data={items}
          keyExtractor={(item, idx) => `${item.label}-${idx}`}
          renderItem={({ item }) => (
            <ContextMenuItem
              label={item.label}
              onPress={() => {
                item.onPress?.();
                onClose();
              }}
              inset={item.inset}
              disabled={item.disabled}
              icon={item.icon}
              isChecked={item.isChecked}
              isRadio={item.isRadio}
            />
          )}
        />
      </View>
    </Modal>
  );
};

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  label,
  onPress,
  inset = false,
  disabled = false,
  icon,
  isChecked = false,
  isRadio = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.itemContainer,
      inset && styles.itemInset,
      disabled && styles.itemDisabled,
    ]}
  >
    {isChecked && (
      <View style={styles.indicator}>
        {isRadio ? (
          <Circle size={16} color="#000" />
        ) : (
          <Check size={16} color="#000" />
        )}
      </View>
    )}
    {icon && <View style={styles.iconContainer}>{icon}</View>}
    <Text style={[styles.itemLabel, disabled && styles.labelDisabled]}>{label}</Text>
    <ChevronRight size={16} color="#6B7280" style={styles.chevron} />
  </TouchableOpacity>
);

// ContextMenuTrigger wraps children and toggles the menu
const ContextMenuTrigger: React.FC<ContextMenuProps & { items: ContextMenuItemProps[] }> = ({
  children,
  items,
}) => {
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <>
      <TouchableOpacity onLongPress={openMenu}>{children}</TouchableOpacity>
      <ContextMenuContent visible={visible} onClose={closeMenu} items={items} />
    </>
  );
};

export { ContextMenuTrigger, ContextMenuItemProps as MenuItemProps };

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemInset: {
    paddingLeft: 24,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  indicator: {
    position: "absolute",
    left: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  labelDisabled: {
    color: "#9CA3AF",
  },
  chevron: {
    marginLeft: 8,
  },
});
