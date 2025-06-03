import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  forwardRef,
} from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { cn } from "@/lib/utils"; // if you still want to merge classnames, else remove
import { buttonVariants } from "@/components/ui/Button"; // optional: you can replace with your own RN button styles

//
// Context to manage dialog visibility and expose a function to toggle it.
//
type AlertDialogContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};
const AlertDialogContext = createContext<AlertDialogContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

//
// AlertDialog: wraps everything and provides context (open/close).
//
interface AlertDialogProps {
  children: ReactNode;
}
export const AlertDialog: React.FC<AlertDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <AlertDialogContext.Provider value={{ isOpen, open, close }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

//
// AlertDialogTrigger: any element that, when pressed, opens the dialog.
//
interface AlertDialogTriggerProps {
  children: ReactNode;
  // We forwardPress to children (e.g. a TouchableOpacity)
}
export const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  children,
}) => {
  const { open } = useContext(AlertDialogContext);

  // We expect the child to be a TouchableOpacity or similar.
  // Wrap in a TouchableOpacity if it's just plain text/button.
  return (
    <TouchableOpacity onPress={open} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

//
// AlertDialogPortal: acts as a placeholder to render Overlay + Content inside Modal.
// In RN, we just render children of Portal when isOpen is true.
//
interface AlertDialogPortalProps {
  children: ReactNode;
}
export const AlertDialogPortal: React.FC<AlertDialogPortalProps> = ({
  children,
}) => {
  const { isOpen } = useContext(AlertDialogContext);

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      statusBarTranslucent
    >
      {children}
    </Modal>
  );
};

//
// AlertDialogOverlay: the semi‐transparent backdrop.
//
interface AlertDialogOverlayProps {}
export const AlertDialogOverlay: React.FC<AlertDialogOverlayProps> = () => {
  return <View style={styles.overlay} />;
};

//
// AlertDialogContent: the centered dialog box.
// Should be used inside <AlertDialogPortal>.
//
interface AlertDialogContentProps {
  children: ReactNode;
}
export const AlertDialogContent = forwardRef<any, AlertDialogContentProps>(
  ({ children }, ref) => {
    return (
      <View ref={ref} style={styles.contentContainer}>
        {children}
      </View>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

//
// AlertDialogHeader: wrapper for title + description.
//
interface AlertDialogHeaderProps {
  children: ReactNode;
}
export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  children,
}) => {
  return <View style={styles.headerContainer}>{children}</View>;
};

//
// AlertDialogFooter: wrapper for action buttons.
//
interface AlertDialogFooterProps {
  children: ReactNode;
}
export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  children,
}) => {
  return <View style={styles.footerContainer}>{children}</View>;
};

//
// AlertDialogTitle: the “heading” text.
//
interface AlertDialogTitleProps {
  children: ReactNode;
}
export const AlertDialogTitle = forwardRef<any, AlertDialogTitleProps>(
  ({ children }, ref) => {
    return (
      <Text ref={ref as any} style={styles.titleText}>
        {children}
      </Text>
    );
  }
);
AlertDialogTitle.displayName = "AlertDialogTitle";

//
// AlertDialogDescription: subheading or body text.
//
interface AlertDialogDescriptionProps {
  children: ReactNode;
}
export const AlertDialogDescription = forwardRef<
  any,
  AlertDialogDescriptionProps
>(({ children }, ref) => {
  return (
    <Text ref={ref as any} style={styles.descriptionText}>
      {children}
    </Text>
  );
});
AlertDialogDescription.displayName = "AlertDialogDescription";

//
// AlertDialogAction: the “confirm” button.
// We call the provided onPress handler AND close the dialog.
//
interface AlertDialogActionProps {
  children: ReactNode;
  onPress: (e: GestureResponderEvent) => void;
}
export const AlertDialogAction = forwardRef<
  any,
  AlertDialogActionProps
>(({ children, onPress }, ref) => {
  const { close } = useContext(AlertDialogContext);

  const handlePress = (e: GestureResponderEvent) => {
    onPress(e);
    close();
  };

  return (
    <TouchableOpacity
      ref={ref as any}
      style={[styles.actionButton, buttonVariants()]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionButtonText}>{children}</Text>
    </TouchableOpacity>
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

//
// AlertDialogCancel: the “cancel” button.
// Just closes the dialog.
//
interface AlertDialogCancelProps {
  children: ReactNode;
}
export const AlertDialogCancel = forwardRef<
  any,
  AlertDialogCancelProps
>(({ children }, ref) => {
  const { close } = useContext(AlertDialogContext);

  return (
    <TouchableOpacity
      ref={ref as any}
      style={[styles.cancelButton, buttonVariants({ variant: "outline" })]}
      onPress={close}
      activeOpacity={0.7}
    >
      <Text style={styles.cancelButtonText}>{children}</Text>
    </TouchableOpacity>
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

//
// Styles
//
type Styles = {
  overlay: ViewStyle;
  contentContainer: ViewStyle;
  headerContainer: ViewStyle;
  footerContainer: ViewStyle;
  titleText: TextStyle;
  descriptionText: TextStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  cancelButton: ViewStyle;
  cancelButtonText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  contentContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "90%",
    maxWidth: 400,
    transform: [{ translateX: -0.5 * 400 }, { translateY: -0.5 * 300 }],
    // You may want to dynamically measure height instead of hardcoding 300
    height: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#3182CE",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A0AEC0",
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    color: "#4A5568",
    fontSize: 16,
    fontWeight: "500",
  },
});
