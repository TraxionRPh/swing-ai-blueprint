// SidebarMenu.native.tsx
import * as React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { Slot } from "@radix-ui/react-slot"; // Note: Radix Slot isn’t RN‐native. You can remove “asChild” support or replace it with your own wrapper.

type SidebarMenuProps = React.ComponentProps<typeof View>;

export const SidebarMenu = React.forwardRef<View, SidebarMenuProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.menu, style]} {...props}>
        {children}
      </View>
    );
  }
);
SidebarMenu.displayName = "SidebarMenu";

type SidebarMenuItemProps = React.ComponentProps<typeof View>;

export const SidebarMenuItem = React.forwardRef<View, SidebarMenuItemProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.menuItem, style]} {...props}>
        {children}
      </View>
    );
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem";

type SidebarMenuActionProps = {
  asChild?: boolean;
  showOnHover?: boolean; // “hover” not supported in RN; this flag is ignored
  onPress?: (e: GestureResponderEvent) => void;
} & Omit<React.ComponentProps<typeof TouchableOpacity>, "children">;

export const SidebarMenuAction = React.forwardRef<
  TouchableOpacity,
  SidebarMenuActionProps
>(({ asChild = false, showOnHover = false, style, children, ...props }, ref) => {
  // In web, “asChild” lets you render a custom component. In RN, Slot isn't commonly used.
  // We’ll default to TouchableOpacity. If asChild=true, you must pass a compatible RN element as the single child.
  const Component: React.ComponentType<any> = asChild ? React.Fragment : TouchableOpacity;

  return (
    <View style={styles.actionWrapper}>
      <Component
        ref={ref}
        onPress={props.onPress}
        style={[styles.actionButton, style]}
        {...(asChild ? {} : props)}
      >
        {children}
      </Component>
    </View>
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

type SidebarMenuBadgeProps = React.ComponentProps<typeof View> & {
  children: React.ReactNode;
};

export const SidebarMenuBadge = React.forwardRef<View, SidebarMenuBadgeProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.badge, style]} {...props}>
        <Text style={styles.badgeText}>{children}</Text>
      </View>
    );
  }
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

// ========== Styles ==========
const styles = StyleSheet.create<{
  menu: ViewStyle;
  menuItem: ViewStyle;
  actionWrapper: ViewStyle;
  actionButton: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
}>({
  // SidebarMenu: vertical list with small gap
  menu: {
    flexDirection: "column",
    width: "100%",
    // Tailwind “min-w-0” is not needed in RN
    // Tailwind “flex-col” → flexDirection: "column"
    // Tailwind “gap-1” → 4px between items. RN’s <View> doesn’t support gap, so we rely on children having marginBottom if needed.
  },

  // SidebarMenuItem: a wrapper (position: relative for absolute children)
  menuItem: {
    position: "relative",
    // Tailwind “group/menu-item” → no direct translation
  },

  // Wrapper for action to handle absolute positioning
  actionWrapper: {
    position: "absolute",
    top: 6,    // Tailwind’s top-1.5 → 1.5 * 4px = 6px
    right: 4,  // Tailwind’s right-1 → 1 * 4px = 4px
    // width/height managed by actionButton
  },

  // SidebarMenuAction: small square button centered content
  actionButton: {
    width: 20,    // Tailwind’s w-5 → 5 * 4px = 20px
    height: 20,   // aspect-square → width == height
    borderRadius: 6, // Tailwind’s rounded-md → 6px
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor, textColor, hover/focus rings: handle externally or via props
  },

  // SidebarMenuBadge: small pill with count/text
  badge: {
    position: "absolute",
    right: 4,   // Tailwind’s right-1 → 4px
    minWidth: 20, // Tailwind’s min-w-5 → 5 * 4px = 20px
    height: 20, // Tailwind’s h-5 → 5 * 4px = 20px
    borderRadius: 6, // Tailwind’s rounded-md → 6px
    paddingHorizontal: 4, // Tailwind’s px-1 → 4px
    backgroundColor: "#1F2937", // “bg-sidebar” or your chosen background
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,        // Tailwind’s text-xs → ~10px
    fontWeight: "500",   // Tailwind’s font-medium
    color: "#F9FAFB",    // “text-sidebar-foreground”
  },
});
