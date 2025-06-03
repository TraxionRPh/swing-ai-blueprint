import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

//
// NavigationMenuContext: tracks which menu item is open (by key).
//
type NavigationMenuContextType = {
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
};

const NavigationMenuContext = createContext<NavigationMenuContextType | null>(null);

function useNavigationMenu() {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) {
    throw new Error("useNavigationMenu must be used within <NavigationMenu>");
  }
  return ctx;
}

//
// NavigationMenuItemContext: each item provides its own key for Trigger & Content.
//
const NavigationMenuItemContext = createContext<{ itemKey: string } | null>(null);

function useNavigationMenuItem() {
  const ctx = useContext(NavigationMenuItemContext);
  if (!ctx) {
    throw new Error("useNavigationMenuItem must be used within <NavigationMenuItem>");
  }
  return ctx;
}

//
// <NavigationMenu> wraps the entire menu and provides openKey state.
//
interface NavigationMenuProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NavigationMenu = forwardRef<View, NavigationMenuProps>(
  ({ children, style, ...props }, ref) => {
    const [openKey, setOpenKey] = useState<string | null>(null);

    return (
      <NavigationMenuContext.Provider value={{ openKey, setOpenKey }}>
        <View ref={ref} style={[styles.menuContainer, style]} {...props}>
          {children}
        </View>
      </NavigationMenuContext.Provider>
    );
  }
);
NavigationMenu.displayName = "NavigationMenu";

//
// <NavigationMenuList> lays out menu items horizontally.
//
interface NavigationMenuListProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NavigationMenuList = forwardRef<View, NavigationMenuListProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.listContainer, style]} {...props}>
        {children}
      </View>
    );
  }
);
NavigationMenuList.displayName = "NavigationMenuList";

//
// <NavigationMenuItem> associates a unique key with its Trigger & Content.
//
interface NavigationMenuItemProps {
  /**
   * Unique key for this menu item. When its Trigger is pressed,
   * openKey is set to this value, showing its Content.
   */
  itemKey: string;
  children: ReactNode;
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  itemKey,
  children,
}) => {
  return (
    <NavigationMenuItemContext.Provider value={{ itemKey }}>
      <View>{children}</View>
    </NavigationMenuItemContext.Provider>
  );
};
NavigationMenuItem.displayName = "NavigationMenuItem";

//
// <NavigationMenuTrigger> is a button that toggles its associated Content.
// It reads `itemKey` from its parent <NavigationMenuItem> context.
//
interface NavigationMenuTriggerProps {
  children: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NavigationMenuTrigger = forwardRef<
  TouchableOpacity,
  NavigationMenuTriggerProps
>(({ children, style, textStyle, ...props }, ref) => {
  const { openKey, setOpenKey } = useNavigationMenu();
  const { itemKey } = useNavigationMenuItem();
  const isOpen = openKey === itemKey;

  const onPress = () => {
    setOpenKey(isOpen ? null : itemKey);
  };

  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      style={[styles.triggerButton, isOpen && styles.triggerButtonActive, style]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.triggerText, isOpen && styles.triggerTextActive, textStyle]}>
        {children}{" "}
      </Text>
      <ChevronDown
        size={16}
        color={isOpen ? "#FFFFFF" : "#374151"}
        style={[
          styles.chevron,
          isOpen && { transform: [{ rotate: "180deg" }] },
        ]}
      />
    </TouchableOpacity>
  );
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

//
// <NavigationMenuContent> renders its children when its `itemKey` matches openKey.
// It appears below the entire list. Adjust as needed for positioning.
//
interface NavigationMenuContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NavigationMenuContent = forwardRef<View, NavigationMenuContentProps>(
  ({ children, style, ...props }, ref) => {
    const { openKey } = useNavigationMenu();
    const { itemKey } = useNavigationMenuItem();

    if (openKey !== itemKey) {
      return null;
    }

    return (
      <View ref={ref} style={[styles.contentContainer, style]} {...props}>
        {children}
      </View>
    );
  }
);
NavigationMenuContent.displayName = "NavigationMenuContent";

//
// <NavigationMenuLink> is an item inside Content that navigates somewhere.
// For RN, we wrap children in a TouchableOpacity and accept an onPress.
//
interface NavigationMenuLinkProps {
  onPress: () => void;
  children: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NavigationMenuLink = forwardRef<
  TouchableOpacity,
  NavigationMenuLinkProps
>(({ onPress, children, style, textStyle, ...props }, ref) => {
  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      style={[styles.linkContainer, style]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.linkText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
});
NavigationMenuLink.displayName = "NavigationMenuLink";

//
// <NavigationMenuViewport> can be used to wrap all Content components.
// Here we simply render its children in a full-width container.
//
interface NavigationMenuViewportProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const NavigationMenuViewport = forwardRef<View, NavigationMenuViewportProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.viewportContainer, style]} {...props}>
        {children}
      </View>
    );
  }
);
NavigationMenuViewport.displayName = "NavigationMenuViewport";

//
// <NavigationMenuIndicator> is a small triangle under the active trigger.
// We approximate with a rotated square. Positioned absolutely under the trigger could be complex in RN.
// Here, we render a small triangle at the bottom of the triggered item if open.
//
interface NavigationMenuIndicatorProps {
  style?: ViewStyle;
}

export const NavigationMenuIndicator = forwardRef<View, NavigationMenuIndicatorProps>(
  ({ style, ...props }, ref) => {
    const { openKey } = useNavigationMenu();
    const { itemKey } = useNavigationMenuItem();
    const isOpen = openKey === itemKey;

    if (!isOpen) {
      return null;
    }

    return <View ref={ref} style={[styles.indicator, style]} {...props} />;
  }
);
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

//
// Styles
//
type Styles = {
  menuContainer: ViewStyle;
  listContainer: ViewStyle;
  triggerButton: ViewStyle;
  triggerButtonActive: ViewStyle;
  triggerText: TextStyle;
  triggerTextActive: TextStyle;
  chevron: ViewStyle;
  contentContainer: ViewStyle;
  linkContainer: ViewStyle;
  linkText: TextStyle;
  viewportContainer: ViewStyle;
  indicator: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  // Container for the entire navigation menu
  menuContainer: {
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "transparent",
  },

  // List of top‐level items laid out horizontally
  listContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },

  // Trigger button style (default)
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF", // bg-background
    borderRadius: 4,
  },
  // Trigger button when active (open)
  triggerButtonActive: {
    backgroundColor: "#3182CE", // accent
  },
  // Trigger text default
  triggerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151", // default text
  },
  // Trigger text when active
  triggerTextActive: {
    color: "#FFFFFF", // accent-foreground
  },
  // Chevron icon wrapper (small offset if needed)
  chevron: {
    marginLeft: 4,
  },

  // Content container (dropdown) rendered below the list
  contentContainer: {
    position: "absolute",
    top: 48, // adjust based on trigger height
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF", // bg-popover
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },

  // Link inside the content
  linkContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 16,
    color: "#3182CE", // primary
  },

  // Viewport container: simply wrap content
  viewportContainer: {
    width: "100%",
    backgroundColor: "transparent",
  },

  // Small triangle indicator under active trigger
  indicator: {
    position: "absolute",
    top: 44, // slightly above content top
    left: "50%",
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: "#E5E7EB", // border color
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
  },
});
