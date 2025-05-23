
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return styles.buttonDefault;
      case 'destructive':
        return styles.buttonDestructive;
      case 'outline':
        return styles.buttonOutline;
      case 'secondary':
        return styles.buttonSecondary;
      case 'ghost':
        return styles.buttonGhost;
      case 'link':
        return styles.buttonLink;
      default:
        return styles.buttonDefault;
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'default':
        return styles.textDefault;
      case 'destructive':
        return styles.textDefault;
      case 'outline':
        return styles.textOutline;
      case 'secondary':
        return styles.textSecondary;
      case 'ghost':
        return styles.textGhost;
      case 'link':
        return styles.textLink;
      default:
        return styles.textDefault;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'default':
        return styles.sizeDefault;
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'icon':
        return styles.sizeIcon;
      default:
        return styles.sizeDefault;
    }
  };

  const getSizeTextStyle = () => {
    switch (size) {
      case 'default':
        return styles.textSizeDefault;
      case 'sm':
        return styles.textSizeSm;
      case 'lg':
        return styles.textSizeLg;
      case 'icon':
        return styles.textSizeDefault;
      default:
        return styles.textSizeDefault;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        typeof children === 'string' ? (
          <Text
            style={[
              styles.text,
              getVariantTextStyle(),
              getSizeTextStyle(),
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDefault: {
    backgroundColor: '#10B981', // primary color
  },
  buttonDestructive: {
    backgroundColor: '#EF4444', // destructive color
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  buttonSecondary: {
    backgroundColor: '#1F2937', // secondary color
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonLink: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
  },
  textDefault: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#E5E7EB',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textGhost: {
    color: '#E5E7EB',
  },
  textLink: {
    color: '#10B981',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  sizeDefault: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  sizeIcon: {
    width: 40,
    height: 40,
    padding: 0,
  },
  textSizeDefault: {
    fontSize: 16,
  },
  textSizeSm: {
    fontSize: 14,
  },
  textSizeLg: {
    fontSize: 18,
  },
});
