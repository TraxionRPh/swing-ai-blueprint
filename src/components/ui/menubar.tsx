// Menubar.native.tsx
import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { Check, Circle, ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  label: string;
  onPress?: () => void;
  inset?: boolean;
  disabled?: boolean;
  isChecked?: boolean;
  isRadio?: boolean;
}

interface MenubarProps {
  children: React.ReactNode;
}

interface MenubarTriggerProps {
  label: string;
  menuItems: MenuItemProps[];
}

// Context to manage which menu is open
const MenubarContext = React.createContext<{
  openMenu: string | null;
  setOpenMenu: (menu: string | null) => void;
}>({ openMenu: null, setOpenMenu: () => {} });

export const Menubar: React.FC<MenubarProps> = ({ children }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  return (
    <MenubarContext.Provider value={{ openMenu, setOpenMenu }}>
      <View style={styles.menubar}>{children}</View>
    </MenubarContext.Provider>
  );
};

export const MenubarTrigger: React.FC<MenubarTriggerProps> = ({
  label,
  menuItems,
}) => {
  const { openMenu, setOpenMenu } = useContext(MenubarContext);
  const [anchorLayout, setAnchorLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  const measureAnchor = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorLayout({ x, y, width, height });
    });
  };

  const open = openMenu === label;

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={() => {
          measureAnchor();
          setOpenMenu(open ? null : label);
        }}
        style={styles.triggerButton}
      >
        <Text style={styles.triggerText}>{label}</Text>
      </TouchableOpacity>
      {anchorLayout && open && (
        <MenubarContent
          visible={open}
          onClose={() => setOpenMenu(null)}
          anchorLayout={anchorLayout}
          items={menuItems}
        />
      )}
    </>
  );
};

interface MenubarContentProps {
  visible: boolean;
  onClose: () => void;
  anchorLayout: { x: number; y: number; width: number; height: number } | null;
  items: MenuItemProps[];
}

const MenubarContent: React.FC<MenubarContentProps> = ({
  visible,
  onClose,
  anchorLayout,
  items,
}) => {
  if (!anchorLayout) return null;
  const { width } = Dimensions.get("window");
  const left = Math.min(anchorLayout.x, width - 200);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.menuContainer, { top: anchorLayout.y + anchorLayout.height + 4, left }]}>
        <FlatList
          data={items}
          keyExtractor={(item, idx) => `${item.label}-${idx}`}
          renderItem={({ item }) => (
            <MenubarItem
              label={item.label}
              onPress={() => {
                item.onPress?.();
                onClose();
              }}
              inset={item.inset}
              disabled={item.disabled}
              isChecked={item.isChecked}
              isRadio={item.isRadio}
            />
          )}
        />
      </View>
    </Modal>
  );
};

const MenubarItem: React.FC<MenuItemProps> = ({
  label,
  onPress,
  inset = false,
  disabled = false,
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
    activeOpacity={0.6}
  >
    {isChecked && (
      <View style={styles.indicator}>
        {isRadio ? <Circle size={16} color="#111827" /> : <Check size={16} color="#111827" />}
      </View>
    )}
    <Text style={[styles.itemLabel, disabled && styles.labelDisabled]}>{label}</Text>
    <ChevronRight size={16} color="#6B7280" style={styles.chevron} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menubar: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
  },
  triggerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
  },
  triggerText: {
    fontSize: 16,
    color: "#111827",
  },
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
  labelDisabled: {
    color: "#9CA3AF",
  },
  indicator: {
    position: "absolute",
    left: 12,
    top: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});
