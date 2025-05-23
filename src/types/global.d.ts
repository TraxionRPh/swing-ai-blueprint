
// Type definitions for React Native components
declare module "react-native" {
  import React from 'react';
  
  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TextProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TextInputProps {
    style?: any;
    placeholder?: string;
    placeholderTextColor?: string;
    keyboardType?: string;
    maxLength?: number;
    value?: string;
    onChangeText?: (text: string) => void;
    [key: string]: any;
  }
  
  export interface TouchableOpacityProps {
    style?: any;
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    [key: string]: any;
  }
  
  export interface ScrollViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export const View: React.FC<ViewProps>;
  export const Text: React.FC<TextProps>;
  export const TextInput: React.FC<TextInputProps>;
  export const TouchableOpacity: React.FC<TouchableOpacityProps>;
  export const ScrollView: React.FC<ScrollViewProps>;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };
  export const SafeAreaView: React.FC<ViewProps>;
}

// Type definitions for lucide-react-native
declare module "lucide-react-native" {
  import React from 'react';
  
  interface IconProps {
    color?: string;
    size?: number | string;
    strokeWidth?: number;
    width?: number | string;
    height?: number | string;
    [key: string]: any;
  }
  
  export const Clock: React.FC<IconProps>;
  export const Trophy: React.FC<IconProps>;
  export const Home: React.FC<IconProps>;
  export const Award: React.FC<IconProps>;
  export const Dumbbell: React.FC<IconProps>;
  export const Calendar: React.FC<IconProps>;
  export const Brain: React.FC<IconProps>;
  export const List: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const FileText: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const Target: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Play: React.FC<IconProps>;
  export const CircleStop: React.FC<IconProps>;
  export const Pause: React.FC<IconProps>;
}

// Type definitions for react-native-svg
declare module "react-native-svg" {
  import React from 'react';
  
  export interface SvgProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: string;
    strokeLinejoin?: string;
    [key: string]: any;
  }
  
  export const Svg: React.FC<SvgProps>;
  export const Path: React.FC<SvgProps>;
}

// Fix for lucide-react
declare module "lucide-react" {
  import React from 'react';
  
  interface IconProps {
    className?: string;
    size?: number | string;
    strokeWidth?: number;
    [key: string]: any;
  }
  
  export const Search: React.FC<IconProps>;
  export const Loader2: React.FC<IconProps>;
}

// Type modifications for our Card component
declare module "@/components/ui/card" {
  import React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';
  
  interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    key?: string | number;
    className?: string;
  }
  
  interface CardHeaderProps {
    children: React.ReactNode;
    style?: ViewStyle;
    className?: string;
  }
  
  interface CardTitleProps {
    children: React.ReactNode;
    style?: TextStyle;
    className?: string;
  }
  
  interface CardDescriptionProps {
    children: React.ReactNode;
    style?: TextStyle;
    className?: string;
  }
  
  interface CardContentProps {
    children: React.ReactNode;
    style?: ViewStyle;
    className?: string;
  }
  
  interface CardFooterProps {
    children: React.ReactNode;
    style?: ViewStyle;
    className?: string;
  }
  
  export const Card: React.FC<CardProps>;
  export const CardHeader: React.FC<CardHeaderProps>;
  export const CardTitle: React.FC<CardTitleProps>;
  export const CardDescription: React.FC<CardDescriptionProps>;
  export const CardContent: React.FC<CardContentProps>;
  export const CardFooter: React.FC<CardFooterProps>;
}

// Type modifications for Badge component
declare module "@/components/ui/badge" {
  import React from 'react';
  import { VariantProps } from "class-variance-authority";
  
  interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<any> {
    children?: React.ReactNode;
    className?: string;
  }
  
  export const Badge: React.FC<BadgeProps>;
  export const badgeVariants: any;
}

// Type modifications for Button component
declare module "@/components/ui/button" {
  import React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';
  
  interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    onClick?: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    className?: string;
    key?: string | number;
  }
  
  export const Button: React.FC<ButtonProps>;
}
