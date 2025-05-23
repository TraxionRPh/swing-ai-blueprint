
import React from 'react';
import { Svg, Path, SvgProps } from 'react-native-svg';
import { Home as HomeIcon, Award as AwardIcon, Dumbbell as DumbbellIcon, Calendar as CalendarIcon, Clock as ClockIcon, Brain as BrainIcon, List as ListIcon, User as UserIcon, FileText as FileTextIcon } from 'lucide-react-native';

// Re-export Lucide icons that are already compatible with React Native
export { HomeIcon as Home, AwardIcon as Award, DumbbellIcon as Dumbbell, CalendarIcon as Calendar, ClockIcon as Clock, BrainIcon as Brain, ListIcon as List, UserIcon as User, FileTextIcon as FileText };

// Custom LucideGolf Icon
export const LucideGolf = (props: SvgProps) => {
  return (
    <Svg
      width={24}
      height={24}
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
