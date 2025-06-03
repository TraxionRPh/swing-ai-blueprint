import React, { useRef, useEffect } from "react";
import {
  Animated,
  ViewStyle,
  StyleProp,
  ViewProps,
  StyleSheet,
} from "react-native";

interface SkeletonProps extends ViewProps {
  /**
   * Optional styling to override or extend the default skeleton appearance.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A simple pulsing placeholder view (skeleton), similar to Tailwind’s `animate-pulse rounded-md bg-muted`.
 * Use for loading placeholders.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ style, ...props }) => {
  // Animated value for pulsing opacity
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Looping pulse animation between opacity 0.3 and 1
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      {...props}
      style={[
        styles.base,
        { opacity: pulseAnim },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#E5E7EB", // Tailwind’s `bg-muted`
    borderRadius: 6,             // Tailwind’s `rounded-md`
  },
});
