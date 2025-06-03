import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

//
// Context to track which AccordionItem is currently open (single‐expand).
//
type AccordionContextType = {
  openItem: string | null;
  setOpenItem: (value: string | null) => void;
};
const AccordionContext = createContext<AccordionContextType>({
  openItem: null,
  setOpenItem: () => {},
});

//
// Accordion: wraps all items and provides context.
//
interface AccordionProps {
  children: ReactNode;
  /**
   * (Optional) initial value of the open item. If not provided, none start open.
   */
  defaultOpenItem?: string;
}
export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpenItem = null,
}) => {
  const [openItem, setOpenItem] = useState<string | null>(defaultOpenItem);

  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem }}>
      <View>{children}</View>
    </AccordionContext.Provider>
  );
};

//
// AccordionItem: expects a `value` prop to identify this section.
// It simply renders its children (Trigger + Content), passing along `itemValue`.
//
interface AccordionItemProps {
  value: string;
  children: ReactNode;
}
export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
}) => {
  // We’ll “inject” itemValue into Trigger & Content via React.Children.map.
  return (
    <View>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { itemValue: value });
      })}
    </View>
  );
};

//
// AccordionTrigger: the clickable header that toggles open/closed.
// It receives `itemValue` via AccordionItem’s clone logic.
//
interface AccordionTriggerProps {
  children: ReactNode;
  // Provided by AccordionItem
  itemValue?: string;
}
export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  itemValue,
}) => {
  const { openItem, setOpenItem } = useContext(AccordionContext);
  const isOpen = openItem === itemValue;

  // Animated rotation for the chevron
  const rotation = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  React.useEffect(() => {
    // Whenever isOpen changes, animate the rotation value from 0→1 or 1→0
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotation]);

  const handlePress = () => {
    setOpenItem(isOpen ? null : itemValue || null);
  };

  // Interpolate rotation value (0 → "0deg", 1 → "180deg")
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity onPress={handlePress} style={styles.triggerContainer}>
      <View style={styles.triggerContent}>
        <Text style={styles.triggerText}>{children}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <ChevronDown size={16} color="#374151" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

//
// AccordionContent: shows or hides its children based on whether its item is open.
//
interface AccordionContentProps {
  children: ReactNode;
  // Provided by AccordionItem
  itemValue?: string;
}
export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  itemValue,
}) => {
  const { openItem } = useContext(AccordionContext);
  if (openItem !== itemValue) {
    return null;
  }
  return <View style={styles.contentContainer}>{children}</View>;
};

//
// Styles
//
type Styles = {
  triggerContainer: ViewStyle;
  triggerContent: ViewStyle;
  triggerText: TextStyle;
  contentContainer: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  triggerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#F9FAFB",
  },
});
