// SidebarProvider.native.tsx
import * as React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TooltipProvider } from "@/components/ui/Tooltip"; // RN‐compatible Tooltip
import { useIsMobile } from "@/hooks/use-mobile";
import {
  SIDEBAR_STORAGE_KEY,
  SIDEBAR_KEYBOARD_SHORTCUT, // you can remove if not used
  SidebarContext,
  type SidebarContextType,
} from "./sidebar-context";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

// You can define a constant for your sidebar widths:
const SIDEBAR_WIDTH = 16 * 16; // 16rem × 16px = 256px
const SIDEBAR_ICON_WIDTH = 3 * 16; // 3rem × 16px = 48px

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const SidebarProvider = React.forwardRef<View, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      children,
    },
    ref
  ) => {
    const isMobile = useIsMobile();

    // Persist “open” state in AsyncStorage instead of a cookie
    const [storedOpen, setStoredOpen] = React.useState<boolean | null>(null);
    const [open, setOpenState] = React.useState<boolean>(defaultOpen);
    const [openMobile, setOpenMobile] = React.useState<boolean>(false);

    // On mount, read from AsyncStorage if available
    React.useEffect(() => {
      AsyncStorage.getItem(SIDEBAR_STORAGE_KEY).then((value) => {
        if (value !== null) {
          const parsed = value === "true";
          setStoredOpen(parsed);
          setOpenState(parsed);
        }
      });
    }, []);

    // Whenever “open” changes, persist it (unless parent controls it via openProp)
    const setOpen = React.useCallback(
      (value: boolean | ((prev: boolean) => boolean)) => {
        const nextOpen =
          typeof value === "function" ? value(open) : value;

        if (setOpenProp) {
          setOpenProp(nextOpen);
        } else {
          setOpenState(nextOpen);
          AsyncStorage.setItem(
            SIDEBAR_STORAGE_KEY,
            nextOpen ? "true" : "false"
          ).catch(() => {
            /* ignore write errors */
          });
        }
      },
      [open, setOpenProp]
    );

    // If parent is controlling “open” via props, override local state
    React.useEffect(() => {
      if (openProp !== undefined && openProp !== open) {
        setOpenState(openProp);
      }
    }, [openProp]);

    // toggleSidebar toggles differently on mobile vs. desktop
    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev);
      } else {
        setOpen((prev) => !prev);
      }
    }, [isMobile, setOpen]);

    // Omit keyboard shortcut listener, since RN doesn’t have window.addEventListener("keydown")

    const state = open ? "expanded" : "collapsed";
    const contextValue: SidebarContextType = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );

    // Root container always full‐screen; on “inset” variant you could apply a background
    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <SafeAreaView
            ref={ref}
            style={styles.root}
            // no “className”—all in StyleSheet
          >
            {children}
          </SafeAreaView>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

// =============== Styles ===============
const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    // If you want an “inset”‐variant background, you can add backgroundColor here
    backgroundColor: "#1F2937", // e.g. “bg-sidebar” if that’s desired by default
  },
});
