import React, { useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface LoadingProps {
  /**
   * Optional message to display under the spinner.
   * Defaults to "Loading...".
   */
  message?: string;
  /**
   * If true, the loader covers the entire screen with a semi‐opaque background.
   */
  fixed?: boolean;
  /**
   * One of 'sm', 'md', or 'lg'. Controls spinner size.
   * 'sm' → ActivityIndicator size="small"
   * 'md' or 'lg' → ActivityIndicator size="large"
   * Defaults to 'md'.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Minimum height for the container when not inline. Can be a number or a pixel string (e.g. "200px").
   * Defaults to "200px".
   */
  minHeight?: string | number;
  /**
   * If true, the spinner and message are laid out horizontally.
   * Defaults to false (vertical layout).
   */
  inline?: boolean;
  /**
   * Additional style to apply to the outer container.
   */
  style?: ViewStyle;
  /**
   * Additional style to apply to the message text.
   */
  textStyle?: TextStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  fixed = false,
  size = "md",
  minHeight = "200px",
  inline = false,
  style,
  textStyle,
}) => {
  // Determine ActivityIndicator size prop
  const indicatorSize = size === "sm" ? "small" : "large";

  // Parse minHeight: if string ending in "px", strip; else parseInt
  const parsedMinHeight = useMemo(() => {
    if (inline) return undefined;
    if (typeof minHeight === "number") {
      return minHeight;
    }
    if (typeof minHeight === "string") {
      const pxValue = minHeight.trim().endsWith("px")
        ? minHeight.trim().slice(0, -2)
        : minHeight.trim();
      const num = parseInt(pxValue, 10);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  }, [minHeight, inline]);

  // Combined container style
  const containerStyles: ViewStyle[] = [styles.container];
  if (fixed) {
    containerStyles.push(styles.fixedOverlay);
  }
  if (inline) {
    containerStyles.push(styles.inlineContainer);
  }
  if (parsedMinHeight !== undefined) {
    containerStyles.push({ minHeight: parsedMinHeight });
  }
  if (style) {
    containerStyles.push(style);
  }

  // Wrapper around spinner + message (handles inline vs vertical)
  const innerWrapperStyles: ViewStyle[] = [styles.innerWrapper];
  if (inline) {
    innerWrapperStyles.push(styles.innerWrapperInline);
  }

  return (
    <View style={containerStyles}>
      <View style={innerWrapperStyles}>
        <ActivityIndicator
          size={indicatorSize}
          color="#3182CE" // Tailwind 'text-primary'
        />
        {message.length > 0 && (
          <Text
            style={[
              styles.messageText,
              inline && styles.messageTextInline,
              textStyle,
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  fixedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFFCC", // approximately bg-background/95
    zIndex: 50,
  },
  inlineContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  innerWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  innerWrapperInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6B7280", // Tailwind 'text-muted-foreground'
    textAlign: "center",
  },
  messageTextInline: {
    marginTop: 0,
    marginLeft: 8,
    textAlign: "left",
  },
});
