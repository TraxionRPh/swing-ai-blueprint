import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  forwardRef,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from "react-native";
import { X } from "lucide-react-native";

// --------------------------------------------------------------------------------
// Context to share open/close state
// --------------------------------------------------------------------------------
type SheetContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const SheetContext = createContext<SheetContextType | null>(null);

function useSheetContext() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useSheetContext must be used within <Sheet>");
  return ctx;
}

// --------------------------------------------------------------------------------
// <Sheet> (root): provides context
// --------------------------------------------------------------------------------
interface SheetProps {
  children: ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};
Sheet.displayName = "Sheet";

// --------------------------------------------------------------------------------
// <SheetTrigger>: toggles open
// --------------------------------------------------------------------------------
interface SheetTriggerProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const SheetTrigger = forwardRef<TouchableOpacity, SheetTriggerProps>(
  ({ children, style, ...props }, ref) => {
    const { setOpen } = useSheetContext();
    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => setOpen(true)}
        style={style}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
);
SheetTrigger.displayName = "SheetTrigger";

// --------------------------------------------------------------------------------
// <SheetClose>: closes the sheet
// --------------------------------------------------------------------------------
interface SheetCloseProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export const SheetClose = forwardRef<TouchableOpacity, SheetCloseProps>(
  ({ children, style, ...props }, ref) => {
    const { setOpen } = useSheetContext();
    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => setOpen(false)}
        style={[styles.closeButton, style]}
        activeOpacity={0.7}
        {...props}
      >
        {children || <X size={20} color="#374151" />}
      </TouchableOpacity>
    );
  }
);
SheetClose.displayName = "SheetClose";

// --------------------------------------------------------------------------------
// <SheetOverlay>: semi‐transparent backdrop
// --------------------------------------------------------------------------------
interface SheetOverlayProps {
  style?: ViewStyle;
}

export const SheetOverlay = forwardRef<View, SheetOverlayProps>(
  ({ style, ...props }, ref) => {
    const { open, setOpen } = useSheetContext();
    return (
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <View ref={ref} style={[styles.overlay, style]} {...props}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
        </View>
      </Modal>
    );
  }
);
SheetOverlay.displayName = "SheetOverlay";

// --------------------------------------------------------------------------------
// <SheetPortal>: wrapper for Overlay + Content
// --------------------------------------------------------------------------------
interface SheetPortalProps {
  children: ReactNode;
}

export const SheetPortal: React.FC<SheetPortalProps> = ({ children }) => {
  return (
    <>
      <SheetOverlay />
      {children}
    </>
  );
};
SheetPortal.displayName = "SheetPortal";

// --------------------------------------------------------------------------------
// <SheetContent>: sliding panel from a side
// --------------------------------------------------------------------------------
type Side = "top" | "bottom" | "left" | "right";

interface SheetContentProps {
  /**
   * Which side the sheet slides in from. Defaults to "right".
   */
  side?: Side;
  children: ReactNode;
  style?: ViewStyle;
}

export const SheetContent = forwardRef<View, SheetContentProps>(
  ({ side = "right", children, style, ...props }, ref) => {
    const { open, setOpen } = useSheetContext();
    const screen = Dimensions.get("window");
    const anim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

    // Compute sheet width/height based on side
    const sheetWidth = side === "left" || side === "right" ? screen.width * 0.75 : screen.width;
    const sheetHeight = side === "top" || side === "bottom" ? screen.height * 0.5 : screen.height;

    // Animate in when `open` becomes true
    useEffect(() => {
      if (open) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Simply reset; no slide-out animation
        anim.setValue(0);
      }
    }, [open, anim]);

    // Derive translation from anim value
    const translateStyle = (() => {
      switch (side) {
        case "left":
          return {
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-sheetWidth, 0],
                }),
              },
            ],
          };
        case "right":
          return {
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [sheetWidth, 0],
                }),
              },
            ],
          };
        case "top":
          return {
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-sheetHeight, 0],
                }),
              },
            ],
          };
        case "bottom":
          return {
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [sheetHeight, 0],
                }),
              },
            ],
          };
        default:
          return {};
      }
    })();

    if (!open) {
      return null;
    }

    return (
      <SheetPortal>
        <Animated.View
          ref={ref}
          style={[
            styles.contentBase,
            sideStyles[side],
            { width: sheetWidth, height: sheetHeight },
            translateStyle,
            style,
          ]}
          {...props}
        >
          {children}
          <SheetClose style={styles.contentCloseButton} />
        </Animated.View>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = "SheetContent";

// Predefined positioning styles for each side
const sideStyles: Record<Side, ViewStyle> = StyleSheet.create({
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  left: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  right: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    borderLeftWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
});

// --------------------------------------------------------------------------------
// <SheetHeader> / <SheetFooter> / <SheetTitle> / <SheetDescription>
// Simple wrappers around View/Text
// --------------------------------------------------------------------------------
interface SheetHeaderProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.headerContainer, style]} {...props}>
      {children}
    </View>
  );
};
SheetHeader.displayName = "SheetHeader";

interface SheetFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const SheetFooter: React.FC<SheetFooterProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.footerContainer, style]} {...props}>
      {children}
    </View>
  );
};
SheetFooter.displayName = "SheetFooter";

interface SheetTitleProps {
  children: ReactNode;
  style?: TextStyle;
}

export const SheetTitle = forwardRef<Text, SheetTitleProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <Text ref={ref} style={[styles.titleText, style]} {...props}>
        {children}
      </Text>
    );
  }
);
SheetTitle.displayName = "SheetTitle";

interface SheetDescriptionProps {
  children: ReactNode;
  style?: TextStyle;
}

export const SheetDescription = forwardRef<Text, SheetDescriptionProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <Text ref={ref} style={[styles.descriptionText, style]} {...props}>
        {children}
      </Text>
    );
  }
);
SheetDescription.displayName = "SheetDescription";

// --------------------------------------------------------------------------------
// Stylesheet
// --------------------------------------------------------------------------------
type Styles = {
  overlay: ViewStyle;
  contentBase: ViewStyle;
  contentCloseButton: ViewStyle;
  headerContainer: ViewStyle;
  footerContainer: ViewStyle;
  titleText: TextStyle;
  descriptionText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 50,
  },
  contentBase: {
    zIndex: 51,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  },
  contentCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  headerContainer: {
    flexDirection: "column",
    marginBottom: 12,
  },
  footerContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  descriptionText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
});
