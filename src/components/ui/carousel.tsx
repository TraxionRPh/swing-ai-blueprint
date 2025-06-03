import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

//
// Context and hook for Carousel state
//
type CarouselContextType = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = createContext<CarouselContextType | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within <Carousel>");
  }
  return context;
}

//
// Carousel: wraps the content and provides context
//
interface CarouselProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Carousel: React.FC<CarouselProps> = ({ children, style }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // When content mounts, CarouselContent will call this to register item count
  const registerCount = (count: number) => {
    setTotalCount(count);
  };

  // Scroll to a given index
  const scrollToIndex = (index: number) => {
    if (!scrollViewRef.current || containerWidth === 0) return;
    scrollViewRef.current.scrollTo({
      x: index * containerWidth,
      animated: true,
    });
  };

  const scrollPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const scrollNext = () => {
    if (currentIndex < totalCount - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < totalCount - 1;

  // Called when layout changes to capture container width
  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // Handle scroll events to update currentIndex
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    if (containerWidth > 0) {
      const newIndex = Math.round(offsetX / containerWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <CarouselContext.Provider
      value={{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <View style={[styles.container, style]} onLayout={onLayout}>
        {/* Pass containerWidth and registerCount to children via React context or props */}
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            scrollViewRef,
            containerWidth,
            onScrollEnd,
            registerCount,
          });
        })}
      </View>
    </CarouselContext.Provider>
  );
};

//
// CarouselContent: horizontal ScrollView with paging
//
interface CarouselContentProps {
  children: ReactNode;
  // Injected by Carousel:
  scrollViewRef?: React.RefObject<ScrollView>;
  containerWidth?: number;
  onScrollEnd?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  registerCount?: (count: number) => void;
  style?: ViewStyle;
}

export const CarouselContent: React.FC<CarouselContentProps> = ({
  children,
  scrollViewRef,
  containerWidth = 0,
  onScrollEnd,
  registerCount,
  style,
}) => {
  // Count items on first render (or children change)
  useEffect(() => {
    const count = React.Children.count(children);
    registerCount?.(count);
  }, [children, registerCount]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onScrollEnd}
      contentContainerStyle={[
        { width: containerWidth * React.Children.count(children) },
      ]}
    >
      {React.Children.map(children, (child, index) => {
        return (
          <View
            style={[
              { width: containerWidth },
              styles.itemWrapper,
            ]}
            key={index}
          >
            {child}
          </View>
        );
      })}
    </ScrollView>
  );
};

//
// CarouselItem: a single slide
//
interface CarouselItemProps {
  children: ReactNode;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ children }) => {
  return <View style={styles.carouselItem}>{children}</View>;
};

//
// CarouselPrevious: button to scroll to previous slide
//
export const CarouselPrevious: React.FC = () => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  if (!canScrollPrev) return null;

  return (
    <TouchableOpacity
      style={[styles.controlButton, styles.prevButton]}
      onPress={scrollPrev}
      activeOpacity={0.7}
      disabled={!canScrollPrev}
    >
      <ChevronLeft size={24} color={canScrollPrev ? "#111827" : "#9CA3AF"} />
    </TouchableOpacity>
  );
};

//
// CarouselNext: button to scroll to next slide
//
export const CarouselNext: React.FC = () => {
  const { scrollNext, canScrollNext } = useCarousel();
  if (!canScrollNext) return null;

  return (
    <TouchableOpacity
      style={[styles.controlButton, styles.nextButton]}
      onPress={scrollNext}
      activeOpacity={0.7}
      disabled={!canScrollNext}
    >
      <ChevronRight size={24} color={canScrollNext ? "#111827" : "#9CA3AF"} />
    </TouchableOpacity>
  );
};

//
// Styles
//
const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  itemWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselItem: {
    flex: 1,
  },
  controlButton: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  prevButton: {
    left: 8,
    top: "50%",
    marginTop: -20,
  },
  nextButton: {
    right: 8,
    top: "50%",
    marginTop: -20,
  },
});
