
import React from 'react';
import { Svg, Path, SvgProps } from 'react-native-svg';
import { 
  Home, 
  Award, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Brain, 
  List, 
  User, 
  FileText,
  Trophy,
  AlertCircle,
  Target,
  Settings,
  LogOut
} from 'lucide-react-native';

// Re-export Lucide icons that are already compatible with React Native
export { 
  Home, 
  Award, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Brain, 
  List, 
  User, 
  FileText,
  Trophy,
  AlertCircle,
  Target,
  Settings,
  LogOut
};

// Custom LucideGolf Icon
export const LucideGolf = (props: SvgProps) => {
  return (
    <Svg
      width={props.width || 24}
      height={props.height || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || 'currentColor'}
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M12 18v-6" />
      <Path d="M7 18v-8" />
      <Path d="M17 18v-4" />
      <Path d="M14 18v-4" />
      <Path d="M10 18v-4" />
      <Path d="M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
      <Path d="m9 8 3-6 3 6" />
      <Path d="M9 7h6" />
    </Svg>
  );
};
