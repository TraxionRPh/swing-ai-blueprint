import React, { useRef, useState, useEffect, ReactNode } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import { GripVertical } from "lucide-react-native";

type Direction = "horizontal" | "vertical";

interface ResizablePanelGroupProps {
  /**
   * Direction of the split: "horizontal" => panels side by side; 
   * "vertical" => panels stacked top/bottom.
   */
  direction?: Direction;
  /**
   * Initial sizes as fractions (sum should be 1). E.g., [0.5, 0.5].
   * If omitted, defaults to equal split.
   */
  initialSizes?: [number, number];
  /**
   * Whether to show a visible handle bar.
   */
  withHandle?: boolean;
  /**
   * Style to apply to the container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Exactly two child panels expected.
   */
  children: [ReactNode, ReactNode];
}

export function ResizablePanelGroup({
  direction = "horizontal",
  initialSizes = [0.5, 0.5],
  withHandle = true,
  style,
  children,
}: ResizablePanelGroupProps) {
  if (!Array.isArray(children) || children.length !== 2) {
    throw new Error("ResizablePanelGroup requires exactly two children.");
  }

  const containerSize = useRef(0); // width or height depending on direction
  const handleSize = 12; // size of the draggable bar
  const [sizes, setSizes] = useState<[number, number]>(initialSizes);

  // Animated value for the panel1 size (in pixels)
  const animValue = useRef(new Animated.Value(0)).current;

  // After layout, set initial pixel-based size
  const onContainerLayout = (e: LayoutChangeEvent) => {
    const layout = direction === "horizontal" ? e.nativeEvent.layout.width : e.nativeEvent.layout.height;
    containerSize.current = layout;
    const initialPixel = initialSizes[0] * (layout - handleSize);
    animValue.setValue(initialPixel);
  };

  // When animValue changes, update relative sizes
  useEffect(() => {
    const listenerId = animValue.addListener(({ value }) => {
      const total = containerSize.current - handleSize;
      if (total > 0) {
        const frac1 = value / total;
        const frac2 = 1 - frac1;
        setSizes([frac1, frac2]);
      }
    });
    return () => {
      animValue.removeListener(listenerId);
    };
  }, [animValue]);

  // PanResponder to drag the handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gestureState) => {
        const delta = direction === "horizontal" ? gestureState.dx : gestureState.dy;
        const newSize = Math.max(
          0,
          Math.min(containerSize.current - handleSize, animValue._value + delta)
        );
        animValue.setValue(newSize);
      },
      onPanResponderRelease: () => {
        // nothing extra on release
      },
    })
  ).current;

  // Styles for panels based on direction
  const panel1Style = direction === "horizontal"
    ? { width: Animated.add(animValue, 0) }
    : { height: Animated.add(animValue, 0) };

  const panel2Style = direction === "horizontal"
    ? { flex: 1 }
    : { flex: 1 };

  const handleStyle = direction === "horizontal"
    ? { width: handleSize, cursor: "ew-resize" }
    : { height: handleSize, cursor: "ns-resize" };

  return (
    <View
      style={[styles.groupContainer, direction === "vertical" && styles.groupVertical, style]}
      onLayout={onContainerLayout}
    >
      <Animated.View style={[styles.panel, panel1Style]}>
        {children[0]}
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.handle, handleStyle]}
      >
        {withHandle && (
          <GripVertical
            size={direction === "horizontal" ? 20 : 24}
            color="#6B7280"
            style={[
              direction === "horizontal"
                ? { transform: [{ rotate: "90deg" }] }
                : {},
            ]}
          />
        )}
      </Animated.View>

      <Animated.View style={[styles.panel, panel2Style]}>
        {children[1]}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "transparent",
  },
  groupVertical: {
    flexDirection: "column",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  handle: {
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
