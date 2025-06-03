// Pagination.native.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
} from "react-native";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react-native";

interface PaginationProps {
  children: React.ReactNode;
  style?: object;
}

export const Pagination: React.FC<PaginationProps> = ({ children, style }) => (
  <View
    accessibilityRole={"navigation" as AccessibilityRole}
    accessibilityLabel="pagination"
    style={[styles.paginationContainer, style]}
  >
    {children}
  </View>
);

interface PaginationContentProps {
  children: React.ReactNode;
  style?: object;
}

export const PaginationContent: React.FC<PaginationContentProps> = ({ children, style }) => (
  <View style={[styles.contentContainer, style]}>{children}</View>
);

interface PaginationItemProps {
  children: React.ReactNode;
  style?: object;
}

export const PaginationItem: React.FC<PaginationItemProps> = ({ children, style }) => (
  <View style={style}>{children}</View>
);

interface PaginationLinkProps {
  isActive?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: object;
}

export const PaginationLink: React.FC<PaginationLinkProps> = ({
  isActive = false,
  onPress,
  children,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.linkBase,
      isActive ? styles.linkActive : styles.linkInactive,
      style,
    ]}
    accessibilityState={{ selected: isActive }}
  >
    {children}
  </TouchableOpacity>
);

interface PaginationPreviousProps {
  onPress?: () => void;
  disabled?: boolean;
}

export const PaginationPrevious: React.FC<PaginationPreviousProps> = ({
  onPress,
  disabled = false,
}) => (
  <PaginationLink
    onPress={onPress}
    style={styles.prevNextContainer}
    isActive={false}
  >
    <ChevronLeft size={16} color={disabled ? "#9CA3AF" : "#111827"} />
    <Text style={[styles.prevNextText, disabled && styles.textDisabled]}>
      Previous
    </Text>
  </PaginationLink>
);

interface PaginationNextProps {
  onPress?: () => void;
  disabled?: boolean;
}

export const PaginationNext: React.FC<PaginationNextProps> = ({
  onPress,
  disabled = false,
}) => (
  <PaginationLink
    onPress={onPress}
    style={styles.prevNextContainer}
    isActive={false}
  >
    <Text style={[styles.prevNextText, disabled && styles.textDisabled]}>
      Next
    </Text>
    <ChevronRight size={16} color={disabled ? "#9CA3AF" : "#111827"} />
  </PaginationLink>
);

interface PaginationEllipsisProps {
  style?: object;
}

export const PaginationEllipsis: React.FC<PaginationEllipsisProps> = ({ style }) => (
  <View style={[styles.ellipsisContainer, style]}>
    <MoreHorizontal size={16} color="#6B7280" />
    <Text style={styles.srOnly}>More pages</Text>
  </View>
);

const styles = StyleSheet.create({
  paginationContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkBase: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  linkActive: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
  },
  linkInactive: {
    backgroundColor: "transparent",
  },
  prevNextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prevNextText: {
    fontSize: 16,
    color: "#111827",
  },
  textDisabled: {
    color: "#9CA3AF",
  },
  ellipsisContainer: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    overflow: "hidden",
    opacity: 0,
  },
});
