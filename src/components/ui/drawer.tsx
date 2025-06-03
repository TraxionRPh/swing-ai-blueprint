import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  FC,
  forwardRef,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { cn } from "@/lib/utils"; // optional, if you still merge class names

//
// DrawerContext: holds `open` state and a toggler
//
type DrawerContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within <Drawer>.");
  return ctx;
}

//
// <Drawer>: root provider, simply wraps children and manages open/close
//
interface DrawerProps {
  children: ReactNode;
  shouldScaleBackground?: boolean; // kept for API compatibility, currently unused
}

export const Drawer: FC<DrawerProps> = ({
  children,
  shouldScaleBackground = true,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};
Drawer.displayName = "Drawer";

//
// <DrawerTrigger>: any element that toggles drawer open
//
interface DrawerTriggerProps {
  children: ReactNode;
}

export const DrawerTrigger: FC<DrawerTriggerProps> = ({ children }) => {
  const { setOpen } = useDrawer();
  return (
    <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};
DrawerTrigger.displayName = "DrawerTrigger";

//
// <DrawerClose>: a button inside drawer content to close it
//
interface DrawerCloseProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export const DrawerClose = forwardRef<TouchableOpacity, DrawerCloseProps>(
  ({ children, style }, ref) => {
    const { setOpen } = useDrawer();
    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => setOpen(false)}
        style={[styles.closeButton, style]}
        activeOpacity={0.7}
      >
        {children || <Text style={styles.closeIcon}>×</Text>}
      </TouchableOpacity>
    );
  }
);
DrawerClose.displayName = "DrawerClose";

//
// <DrawerOverlay>: semi-transparent backdrop when drawer is open
//
interface DrawerOverlayProps {
  style?: ViewStyle;
}

export const DrawerOverlay = forwardRef<View, DrawerOverlayProps>(
  ({ style }, ref) => {
    const { open, setOpen } = useDrawer();
    return (
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlayContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            ref={ref}
            style={[styles.overlay, style]}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);
DrawerOverlay.displayName = "DrawerOverlay";

//
// <DrawerPortal>: wrapper that injects overlay and content
//
interface DrawerPortalProps {
  children: ReactNode;
}

export const DrawerPortal: FC<DrawerPortalProps> = ({ children }) => {
  return (
    <>
      <DrawerOverlay />
      {children}
    </>
  );
};
DrawerPortal.displayName = "DrawerPortal";

//
// <DrawerContent>: the sliding panel from bottom
//
interface DrawerContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const DrawerContent = forwardRef<View, DrawerContentProps>(
  ({ children, style }, ref) => {
    const { open } = useDrawer();
    const slideAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

    // Slide up when `open` becomes true, slide down when false
    useEffect(() => {
      Animated.timing(slideAnim, {
        toValue: open ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [open, slideAnim]);

    // Calculate translateY from slideAnim interpolation
    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Dimensions.get("window").height, 0],
    });

    if (!open) {
      // Optionally, keep rendered but off-screen. We'll let translateY handle it.
    }

    return (
      <DrawerPortal>
        <Animated.View
          ref={ref}
          style={[
            styles.contentContainer,
            { transform: [{ translateY }] },
            style,
          ]}
        >
          {/* The little “grabber” handle on top */}
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </DrawerPortal>
    );
  }
);
DrawerContent.displayName = "DrawerContent";

//
// <DrawerHeader>: top section inside content
//
interface DrawerHeaderProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const DrawerHeader: FC<DrawerHeaderProps> = ({ children, style }) => {
  return <View style={[styles.headerContainer, style]}>{children}</View>;
};
DrawerHeader.displayName = "DrawerHeader";

//
// <DrawerFooter>: bottom section inside content
//
interface DrawerFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const DrawerFooter: FC<DrawerFooterProps> = ({ children, style }) => {
  return <View style={[styles.footerContainer, style]}>{children}</View>;
};
DrawerFooter.displayName = "DrawerFooter";

//
// <DrawerTitle>: heading text
//
interface DrawerTitleProps {
  children: ReactNode;
  style?: TextStyle;
}

export const DrawerTitle = forwardRef<Text, DrawerTitleProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.titleText, style]}>
        {children}
      </Text>
    );
  }
);
DrawerTitle.displayName = "DrawerTitle";

//
// <DrawerDescription>: description text
//
interface DrawerDescriptionProps {
  children: ReactNode;
  style?: TextStyle;
}

export const DrawerDescription = forwardRef<Text, DrawerDescriptionProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.descriptionText, style]}>
        {children}
      </Text>
    );
  }
);
DrawerDescription.displayName = "DrawerDescription";

//
// Styles
//
type Styles = {
  overlayContainer: ViewStyle;
  overlay: ViewStyle;
  contentContainer: ViewStyle;
  handle: ViewStyle;
  closeButton: ViewStyle;
  closeIcon: TextStyle;
  headerContainer: ViewStyle;
  footerContainer: ViewStyle;
  titleText: TextStyle;
  descriptionText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Full‐screen backdrop to intercept taps
  overlayContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
  },

  // Content: placed at bottom, slides up
  contentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  // Top “handle” bar
  handle: {
    alignSelf: "center",
    marginTop: 8,
    width: 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },

  // Close button (if used inside content)
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
  },
  closeIcon: {
    fontSize: 18,
    color: "#374151",
    opacity: 0.7,
  },

  // Header: padding + center/text‐left depending on width
  headerContainer: {
    padding: 16,
    alignItems: "center",
  },

  // Footer: pushes to bottom with auto margin
  footerContainer: {
    marginTop: "auto",
    padding: 16,
    flexDirection: "column",
    gap: 8,
  },

  // Title style
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },

  // Description style
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
