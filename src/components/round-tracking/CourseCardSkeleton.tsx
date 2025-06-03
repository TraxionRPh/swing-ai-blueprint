import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// A simple gray box to mimic a skeleton line
const Skeleton = ({ style }: { style?: object }) => (
  <View style={[styles.skeletonBase, style]} />
);

export const CourseCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Skeleton style={styles.skeletonTitle} />
        <Skeleton style={styles.skeletonSubtitle} />
        <Skeleton style={styles.skeletonLine} />
      </View>
    </View>
  );
};

export const CourseCardSkeletonGrid = ({
  count = 9,
}: {
  count?: number;
}) => {
  // Determine number of columns based on screen width
  // 1 column if narrow, 2 for medium, 3 for wider
  let numColumns = 1;
  if (SCREEN_WIDTH >= 800) {
    numColumns = 3;
  } else if (SCREEN_WIDTH >= 500) {
    numColumns = 2;
  }

  const data = Array.from({ length: count }, (_, i) => ({ key: i.toString() }));

  return (
    <FlatList
      data={data}
      renderItem={() => <CourseCardSkeleton />}
      keyExtractor={(item) => item.key}
      numColumns={numColumns}
      columnWrapperStyle={
        numColumns > 1 ? styles.columnWrapper : undefined
      }
      contentContainerStyle={styles.gridContainer}
    />
  );
};

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 8,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
    // Ensure cards flexibly size in grid
    flex: 1,
  },
  cardContent: {
    padding: 16,
  },
  // Skeleton line base
  skeletonBase: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  // Specific skeleton sizes
  skeletonTitle: {
    height: 20,
    width: "75%",
    marginBottom: 12,
  },
  skeletonSubtitle: {
    height: 16,
    width: "50%",
    marginBottom: 12,
  },
  skeletonLine: {
    height: 16,
    width: "33%",
  },
  // Grid container padding
  gridContainer: {
    padding: 8,
  },
  // If multiple columns, add spacing between items
  columnWrapper: {
    justifyContent: "space-between",
  },
});
