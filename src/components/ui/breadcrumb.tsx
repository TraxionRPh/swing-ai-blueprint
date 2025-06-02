// src/components/ui/breadcrumb.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  type ViewProps,
  type TextProps,
} from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";
import { cn } from "@/lib/utils"; // your classnames helper

// ------------------------------------------------------------------
// <Breadcrumb> acts like a <nav aria-label="breadcrumb"> but in RN.
// ------------------------------------------------------------------
type BreadcrumbProps = ViewProps & {
  // You can pass a custom separator (e.g. an icon or text). Defaults to the ChevronRight icon.
  separator?: React.ReactNode;
};
export function Breadcrumb({
  children,
  separator,
  style,
  ...props
}: BreadcrumbProps) {
  return (
    <View
      accessibilityRole="navigation"
      aria-label="breadcrumb"
      // flex-row: lay children out horizontally
      className="flex-row items-center"
      style={style}
      {...props}
    >
      {React.Children.toArray(children).map((child, idx) => {
        // Between each pair of items, render the separator
        if (idx > 0) {
          return (
            <View
              key={`sep-${idx}`}
              className="mx-1 items-center justify-center"
            >
              {separator ?? <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </View>
          );
        }
        return child;
      })}
    </View>
  );
}

// ------------------------------------------------------------------
// <BreadcrumbList> is simply a wrapper <View> that can flex-wrap, gap, etc.
// In HTML it was <ol>. Here it’s just a <View> with the same Tailwind classes.
// ------------------------------------------------------------------
type BreadcrumbListProps = ViewProps;
export const BreadcrumbList = React.forwardRef<View, BreadcrumbListProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        // mimic the original Tailwind: "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5"
        className={cn(
          "flex flex-row flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5",
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
BreadcrumbList.displayName = "BreadcrumbList";

// ------------------------------------------------------------------
// <BreadcrumbItem> replaces <li>. It just wraps each entry in a View.
// ------------------------------------------------------------------
type BreadcrumbItemProps = ViewProps;
export const BreadcrumbItem = React.forwardRef<View, BreadcrumbItemProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        // "inline-flex items-center gap-1.5" → in RN we just do flex-row with gap
        className={cn("flex flex-row items-center gap-1.5", className)}
        style={style}
        {...props}
      />
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

// ------------------------------------------------------------------
// <BreadcrumbLink> replaces <a>. We make it a TouchableOpacity + Text.
// Use `asChild` if you want to pass a custom component via Slot (optional).
// ------------------------------------------------------------------
type BreadcrumbLinkProps = TextProps & {
  asChild?: boolean;
  onPress?: () => void;
};
export const BreadcrumbLink = React.forwardRef<Text, BreadcrumbLinkProps>(
  ({ asChild, className, children, onPress, style, ...props }, ref) => {
    // If you want to render a custom child (e.g. <Slot>), you can. Otherwise, default to TouchableOpacity+Text.
    if (asChild) {
      // If using Radix Slot, wrap it in a TouchableOpacity
      return (
        <TouchableOpacity
          ref={ref as any}
          onPress={onPress}
          className={cn("flex-row", className)}
          style={style}
          {...props}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        ref={ref as any}
        onPress={onPress}
        className={cn("transition-colors hover:text-foreground", className)}
        style={style}
        {...props}
      >
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

// ------------------------------------------------------------------
// <BreadcrumbPage> replaces <span> for “current page.” We render as Text only.
// ------------------------------------------------------------------
type BreadcrumbPageProps = TextProps & {
  onPress?: () => void;
};
export const BreadcrumbPage = React.forwardRef<Text, BreadcrumbPageProps>(
  ({ className, children, onPress, style, ...props }, ref) => {
    // Render current page as non-pressable Text with aria-current="page" equivalent.
    // If you prefer it pressable, wrap in TouchableOpacity and call onPress.
    return (
      <Text
        ref={ref}
        accessibilityRole="text"
        accessibilityState={{ disabled: true }}
        className={cn("font-normal text-foreground", className)}
        style={style}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
BreadcrumbPage.displayName = "BreadcrumbPage";

// ------------------------------------------------------------------
// <BreadcrumbSeparator> is just a <View> that shows either children or a default icon.
// In RN, use a View + Icon (no <li> needed).
// ------------------------------------------------------------------
type BreadcrumbSeparatorProps = ViewProps;
export function BreadcrumbSeparator({
  children,
  className,
  style,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <View
      // "role=presentation aria-hidden=true" are web-only, so skip them.
      className={cn("items-center justify-center", className)}
      style={style}
      {...props}
    >
      {children ?? <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </View>
  );
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// ------------------------------------------------------------------
// <BreadcrumbEllipsis> replaces the “...” item. We use a View + Icon + invisible Text for a11y.
// ------------------------------------------------------------------
type BreadcrumbEllipsisProps = ViewProps;
export function BreadcrumbEllipsis({
  className,
  style,
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <View
      className={cn("h-9 w-9 items-center justify-center", className)}
      style={style}
      {...props}
    >
      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      {/* Invisible text solely for screen-reader purposes */}
      <Text className="sr-only">More</Text>
    </View>
  );
}
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
