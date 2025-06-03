import React from "react";
import { View, StyleSheet } from "react-native";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/Toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <View style={styles.contentContainer}>
            {title != null && <ToastTitle>{title}</ToastTitle>}
            {description != null && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </View>

          {action != null && <View style={styles.actionContainer}>{action}</View>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  // Mimics “grid gap-1” from Tailwind (i.e. vertical spacing of ~4px between children)
  contentContainer: {
    flexDirection: "column",
    // If you want a small gap between title & description, you can add a marginBottom on the second element instead.
    // For example, you can style ToastTitle and ToastDescription directly.
  },
  // Optional: wrap “action” in its own container to add margins/padding if needed
  actionContainer: {
    marginTop: 8, // adjust as needed
  },
});
