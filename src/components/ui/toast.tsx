
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing } from 'react-native';
import { X } from 'lucide-react-native';

type ToastVariant = 'default' | 'destructive' | 'success';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (props: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      variant: 'default',
      duration: 2000, // Default to 2 seconds
      ...props,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
};

interface ToastComponentProps {
  toast: Toast;
  onDismiss: () => void;
  onLayout?: (height: number) => void;
}

const ToastComponent = ({ toast, onDismiss, onLayout }: ToastComponentProps) => {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getVariantStyle = () => {
    switch (toast.variant) {
      case 'destructive':
        return styles.toastDestructive;
      case 'success':
        return styles.toastSuccess;
      default:
        return {};
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        getVariantStyle(),
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      onLayout={(event) => onLayout && onLayout(event.nativeEvent.layout.height)}
    >
      <View style={styles.toastContent}>
        {toast.title && <Text style={styles.toastTitle}>{toast.title}</Text>}
        {toast.description && (
          <Text style={styles.toastDescription}>{toast.description}</Text>
        )}
      </View>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <X size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

const ToastContainer = ({ toasts, dismissToast }: ToastContainerProps) => {
  const [heights, setHeights] = useState<Record<string, number>>({});

  const handleLayout = (id: string, height: number) => {
    setHeights((prev) => ({ ...prev, [id]: height }));
  };

  const getToastPosition = (index: number) => {
    let position = 16; // Starting position (top margin)
    for (let i = 0; i < index; i++) {
      const id = toasts[i]?.id;
      if (id && heights[id]) {
        position += heights[id] + 8; // Add toast height + margin between toasts
      }
    }
    return position;
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          style={[styles.toastWrapper, { top: getToastPosition(index) }]}
        >
          <ToastComponent
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
            onLayout={(height) => handleLayout(toast.id, height)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#1A1F2C',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2A2F3C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastDestructive: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  toastSuccess: {
    backgroundColor: '#065F46',
    borderColor: '#064E3B',
  },
  toastContent: {
    flex: 1,
    marginRight: 8,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  toastDescription: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});
