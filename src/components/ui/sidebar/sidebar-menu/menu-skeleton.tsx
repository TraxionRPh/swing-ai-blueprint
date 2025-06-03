// SidebarMenuSkeleton.native.tsx
import * as React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Skeleton } from "@/components/ui/Skeleton"; // RN version of Skeleton

type SidebarMenuSkeletonProps = React.ComponentProps<typeof View> & {
  showIcon?: boolean;
};

export const SidebarMenuSkeleton = React.forwardRef<View, SidebarMenuSkeletonProps>(
  ({ style, showIcon = false, ...props }, ref) => {
    // Generate a random width between 50% and 90% as a string
    const width = React.useMemo(() => {
      const pct = Math.floor(Math.random() * 40) + 50; // random integer [50, 89]
      return `${pct}%`;
    }, []);

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        {showIcon && (
          <Skeleton style={styles.iconSkeleton} />
        )}
        <Skeleton
          style={[styles.textSkeleton, { width }]}
        />
      </View>
    );
  }
);
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

// ---------- Styles ----------
const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create<{
  container: ViewStyle;
  iconSkeleton: ViewStyle;
  textSkeleton: ViewStyle;
}>({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,           // h-8 → 8 * 4px = 32px
    borderRadius: 6,      // rounded-md → 6px
    paddingHorizontal: 8, // px-2 → 8px
    backgroundColor: "transparent",
  },
  iconSkeleton: {
    width: 16,            // size-4 → 16px
    height: 16,           // size-4 → 16px
    borderRadius: 4,      // rounded-md on icon → 4px
    marginRight: 8,       // gap-2 → 8px
    backgroundColor: "#E5E7EB", // default skeleton bg (light gray)
  },
  textSkeleton: {
    height: 16,          // h-4 → 16px
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    flexGrow: 1,
    // width will be overridden at runtime by `{ width }`
  },
});
