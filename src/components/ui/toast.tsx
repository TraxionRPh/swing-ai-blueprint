
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle } from '@/components/icons/CustomIcons';

type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [lastId, setLastId] = useState(0);

  const toast = (props: ToastProps) => {
    const id = lastId + 1;
    setLastId(id);
    
    const newToast = {
      ...props,
      id,
      duration: props.duration || 3000,
    };
    
    setToasts(prev => [...prev, newToast]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <SafeAreaView style={styles.container} edges={['top']}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </SafeAreaView>
    </ToastContext.Provider>
  );
};

interface ToastComponentProps extends ToastProps {
  onClose: () => void;
}

const Toast: React.FC<ToastComponentProps> = ({
  title,
  description,
  variant = 'default',
  duration = 3000,
  onClose,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const offset = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        onClose();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, opacity, offset]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return styles.success;
      case 'destructive':
        return styles.destructive;
      case 'warning':
        return styles.warning;
      default:
        return styles.default;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        getVariantStyles(),
        { opacity, transform: [{ translateY: offset }] }
      ]}
    >
      <View style={styles.iconContainer}>
        <AlertCircle width={20} height={20} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  default: {
    backgroundColor: '#1E293B',
  },
  success: {
    backgroundColor: '#059669',
  },
  destructive: {
    backgroundColor: '#DC2626',
  },
  warning: {
    backgroundColor: '#D97706',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

// Create a basic Button component for React Native
export const Button = ({ children, ...props }) => {
  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
};
