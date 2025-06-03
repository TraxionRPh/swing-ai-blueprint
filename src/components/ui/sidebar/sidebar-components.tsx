// Sidebar.native.tsx
import * as React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSidebar } from "./sidebar-context";
// Assume you have RN versions of Separator, Input, Sheet, and SheetContent:
import { Separator } from "@/components/ui/Separator";
import { Input } from "@/components/ui/Input";
import { Slot } from "@radix-ui/react-slot"; // Slot likely isn’t RN‐native—remove or replace as needed
import { Sheet, SheetContent } from "@/components/ui/Sheet";

type SidebarProps = React.ComponentProps<typeof View> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};

export const Sidebar = React.forwardRef<View, SidebarProps>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    const sidebarWidth = 288; // 18rem * 16px = 288px
    const iconWidth = 56; // example for “--sidebar-width-icon” (3.5rem * 16px)

    // If collapsible="none", we always render a fixed sidebar container
    if (collapsible === "none") {
      return (
        <View
          ref={ref}
          style={[
            styles.baseSidebar,
            { width: sidebarWidth, backgroundColor: "#1F2937" }, // bg-sidebar
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      );
    }

    // On mobile, use a Sheet (Modal) for offcanvas behavior
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            side={side}
            style={{
              width: sidebarWidth,
              backgroundColor: "#1F2937", // bg-sidebar
              padding: 0,
              transform: [{ translateX: side === "left" ? 0 : 0 }],
            }}
          >
            <View style={styles.mobileContainer}>{children}</View>
          </SheetContent>
        </Sheet>
      );
    }

    // Desktop/tablet: render a fixed sidebar that can collapse
    // “state” might be "collapsed" or "expanded"
    const isCollapsed = state === "collapsed";


    // Main sidebar container
    const dynamicSidebarWidth =
      isCollapsed && collapsible === "offcanvas"
        ? 0
        : isCollapsed && collapsible === "icon"
        ? iconWidth
        : sidebarWidth;

    const positionStyles =
      side === "left"
        ? { left: isCollapsed && collapsible === "offcanvas" ? -sidebarWidth : 0 }
        : { right: isCollapsed && collapsible === "offcanvas" ? -sidebarWidth : 0 };

    const floatingStyles =
      variant === "floating" || variant === "inset"
        ? {
            padding: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#374151", // sidebar-border
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }
        : {};

    return (
      <View
        ref={ref}
        style={[
          styles.desktopSidebarWrapper,
          { width: dynamicSidebarWidth },
          positionStyles,
          floatingStyles,
          style,
        ]}
        {...props}
      >
        {/* Inner content with background */}
        <View style={[styles.innerContainer, { backgroundColor: "#1F2937" }]}>
          {children}
        </View>
      </View>
    );
  }
);
Sidebar.displayName = "Sidebar";

export const SidebarGroup = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[styles.group, style]} {...props} />
  )
);
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  View,
  React.ComponentProps<typeof View>
>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.groupLabel, style]} {...props} />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  View,
  React.ComponentProps<typeof View>
>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.groupContent, style]} {...props} />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarContent = React.forwardRef<
  View,
  React.ComponentProps<typeof View>
>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.content, style]} {...props} />
));
SidebarContent.displayName = "SidebarContent";

export const SidebarHeader = React.forwardRef<
  View,
  React.ComponentProps<typeof View>
>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.headerFooter, style]} {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<
  View,
  React.ComponentProps<typeof View>
>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.headerFooter, style]} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ style, ...props }, ref) => (
  <Separator
    ref={ref}
    style={[styles.separator, style]}
    {...props}
  />
));
SidebarSeparator.displayName = "SidebarSeparator";

export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ style, ...props }, ref) => (
  <Input
    ref={ref}
    style={[styles.input, style]}
    {...props}
  />
));
SidebarInput.displayName = "SidebarInput";

// ---------- Stylesheet ----------

const { height: windowHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  baseSidebar: {
    flexDirection: "column",
    height: windowHeight, // h-full
    // width: controlled by parent (using “width: sidebarWidth” inline)
  },
  mobileContainer: {
    flex: 1,
    flexDirection: "column",
    paddingTop: Platform.OS === "ios" ? 40 : 20, // safe‐area + status bar
  },
  desktopSidebarWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    // z-index: mimic z-10
    zIndex: 10,
    flexDirection: "column",
    height: windowHeight,
    // width is computed inline via dynamicSidebarWidth
    overflow: "hidden",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
  },
  group: {
    flexDirection: "column",
    gap: 8, // 2 * 4px (flexGap isn’t supported in RN—see Notes)
  },
  groupLabel: {
    paddingHorizontal: 8,
    // text-xs font-medium tracking-wide text-sidebar-foreground/50:
    // You’ll need a <Text> wrapper inside this View if you want actual text styling.
    // Here we just provide padding; the user can insert a <Text> child.
  },
  groupContent: {
    flexDirection: "column",
    gap: 4, // 1 * 4px
  },
  content: {
    flex: 1,
    flexDirection: "column",
    gap: 8, // 2 * 4px
    // overflow-auto → use ScrollView if needed
  },
  headerFooter: {
    flexDirection: "column",
    gap: 8, // 2 * 4px
    padding: 8,
  },
  separator: {
    marginHorizontal: 8,
    backgroundColor: "#374151", // sidebar-border
    height: 1,
  },
  input: {
    height: 32, // h-8
    width: "100%",
    backgroundColor: "#111827", // bg-background (or whichever)
    paddingHorizontal: 8,
    borderRadius: 4,
    // shadow-none → no shadow
    // focus-visible:ring-2 focus-visible:ring-sidebar-ring: not directly available;
    // you can wrap with TextInput and manage focus styling separately.
  },
});
