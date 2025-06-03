// ChallengeLibrary.native.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useChallengeLibrary } from "@/hooks/useChallengeLibrary";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Loading } from "@/components/ui/Loading";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";

const CATEGORY_OPTIONS = ["all", "driving", "irons", "chipping", "putting"];

export const ChallengeLibrary: React.FC = () => {
  const { challenges, isLoading, progress } = useChallengeLibrary();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredChallenges, setFilteredChallenges] = useState(challenges || []);
  const queryClient = useQueryClient();

  const window = useWindowDimensions();
  const screenWidth = window.width;

  // Determine number of columns based on screen width
  const numColumns = screenWidth < 600 ? 1 : screenWidth < 900 ? 2 : 3;
  const GAP = 12;
  const HORIZONTAL_PADDING = 16;
  const itemWidth =
    (screenWidth - HORIZONTAL_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;

  // Filter challenges whenever selectedCategory or challenges change
  useEffect(() => {
    if (!challenges) {
      setFilteredChallenges([]);
      return;
    }
    if (selectedCategory === "all") {
      setFilteredChallenges(challenges);
    } else {
      const filtered = challenges.filter(
        (challenge) =>
          challenge.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredChallenges(filtered);
    }
  }, [selectedCategory, challenges]);

  // Force-refresh on mount
  useEffect(() => {
    (async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-challenge-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["challenges"] }),
      ]);
    })();
  }, [queryClient]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading challenges..." />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Challenge Library</Text>
        <Text style={styles.subtitle}>
          Track your progress with measurable golf challenges
        </Text>
      </View>

      <Tabs
        currentValue={selectedCategory}
        onValueChange={setSelectedCategory}
        style={styles.tabsContainer}
      >
        <TabsList style={styles.tabsList}>
          {CATEGORY_OPTIONS.map((category) => {
            const label =
              category === "all"
                ? "All Challenges"
                : category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <TabsTrigger
                key={category}
                value={category}
                style={[
                  styles.tabTrigger,
                  selectedCategory === category && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === category && styles.activeTabText,
                  ]}
                >
                  {label}
                </Text>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <View style={styles.cardsWrapper}>
        {filteredChallenges.map((challenge) => {
          const challengeProgress = progress.find(
            (p) => p.challenge_id === challenge.id
          );
          return (
            <View
              key={challenge.id}
              style={[
                styles.cardContainer,
                { width: itemWidth, marginRight: GAP, marginBottom: GAP },
                // remove right margin for last in row
                (filteredChallenges.indexOf(challenge) + 1) % numColumns === 0
                  ? { marginRight: 0 }
                  : {},
              ]}
            >
              <ChallengeCard
                challenge={challenge}
                progress={challengeProgress}
                style={styles.challengeCard}
              />
            </View>
          );
        })}

        {/* If the last row is not full, we can add empty Views to fill gaps */}
        {filteredChallenges.length % numColumns !== 0 &&
          Array.from(
            { length: numColumns - (filteredChallenges.length % numColumns) },
            (_, idx) => (
              <View
                key={`spacer-${idx}`}
                style={[styles.cardContainer, { width: itemWidth, marginRight: GAP }]}
              />
            )
          )}
      </View>
    </ScrollView>
  );
};

export default ChallengeLibrary;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F3F4F6",
    padding: 4,
    borderRadius: 6,
  },
  tabTrigger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    color: "#374151",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  cardsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardContainer: {
    // width is set dynamically
    marginBottom: 12,
  },
  challengeCard: {
    flex: 1,
  },
});
