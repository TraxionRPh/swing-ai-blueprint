import React, { createContext, useContext, useState, ReactNode, forwardRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { X } from "lucide-react-native";
import { cn } from "@/lib/utils"; // Optional: if you still need to merge inline styles

//
// DialogContext to share open/close state
//
type DialogContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialogContext must be used within <Dialog>");
  }
  return ctx;
}

//
// <Dialog> acts like Radix’s Root: provides context and renders children
//
interface DialogProps {
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};
Dialog.displayName = "Dialog";

//
// <DialogTrigger> opens the dialog when pressed
//
interface DialogTriggerProps {
  children: ReactNode;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  const { setOpen } = useDialogContext();
  return (
    <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};
DialogTrigger.displayName = "DialogTrigger";

//
// <DialogPortal> renders everything inside a React Native <Modal> when open
//
interface DialogPortalProps {
  children: ReactNode;
}

export const DialogPortal: React.FC<DialogPortalProps> = ({ children }) => {
  const { open, setOpen } = useDialogContext();

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => setOpen(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
};
DialogPortal.displayName = "DialogPortal";

//
// <DialogOverlay> is the semi‐transparent backdrop
//
interface DialogOverlayProps {
  style?: ViewStyle;
}

export const DialogOverlay = forwardRef<View, DialogOverlayProps>(
  ({ style }, ref) => {
    return <View ref={ref} style={[styles.overlay, style]} />;
  }
);
DialogOverlay.displayName = "DialogOverlay";

//
// <DialogClose> closes the dialog when pressed
//
interface DialogCloseProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export const DialogClose = forwardRef<TouchableOpacity, DialogCloseProps>(
  ({ children, style }, ref) => {
    const { setOpen } = useDialogContext();
    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => setOpen(false)}
        style={[styles.closeButton, style]}
        activeOpacity={0.7}
      >
        {children || <X style={styles.closeIcon} />}
      </TouchableOpacity>
    );
  }
);
DialogClose.displayName = "DialogClose";

//
// <DialogContent> renders the dialog box in the center
//
interface DialogContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const DialogContent = forwardRef<View, DialogContentProps>(
  ({ children, style }, ref) => {
    return (
      <DialogPortal>
        <DialogOverlay />
        <View ref={ref} style={[styles.contentContainer, style]}>
          {children}
          {/* Radix’s close is inside content; place a default if none provided */}
          <DialogClose />
        </View>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = "DialogContent";

//
// <DialogHeader> wraps title/description
//
interface DialogHeaderProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, style }) => {
  return <View style={[styles.headerContainer, style]}>{children}</View>;
};
DialogHeader.displayName = "DialogHeader";

//
// <DialogFooter> wraps action buttons
//
interface DialogFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, style }) => {
  return <View style={[styles.footerContainer, style]}>{children}</View>;
};
DialogFooter.displayName = "DialogFooter";

//
// <DialogTitle> renders the heading text
//
interface DialogTitleProps {
  children: ReactNode;
  style?: TextStyle;
}

export const DialogTitle = forwardRef<Text, DialogTitleProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.titleText, style]}>
        {children}
      </Text>
    );
  }
);
DialogTitle.displayName = "DialogTitle";

//
// <DialogDescription> renders the subheading/body text
//
interface DialogDescriptionProps {
  children: ReactNode;
  style?: TextStyle;
}

export const DialogDescription = forwardRef<Text, DialogDescriptionProps>(
  ({ children, style }, ref) => {
    return (
      <Text ref={ref} style={[styles.descriptionText, style]}>
        {children}
      </Text>
    );
  }
);
DialogDescription.displayName = "DialogDescription";

//
// Styles
//
type Styles = {
  modalBackdrop: ViewStyle;
  overlay: ViewStyle;
  contentContainer: ViewStyle;
  closeButton: ViewStyle;
  closeIcon: ViewStyle;
  headerContainer: ViewStyle;
  footerContainer: ViewStyle;
  titleText: TextStyle;
  descriptionText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  // Backdrop: semi‐transparent full‐screen
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Overlay: same as backdrop color in case you need separate layering
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  // Content container: centered box
  contentContainer: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  },
  // Close button: positioned top‐right inside content
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
    opacity: 0.7,
  },
  closeIcon: {
    width: 24,
    height: 24,
    color: "#374151",
  },
  // Header: vertical stack, center on small screens
  headerContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  // Footer: buttons aligned to end on larger screens
  footerContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    marginTop: 24,
  },
  // Title text
  titleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  // Description text
  descriptionText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
});
