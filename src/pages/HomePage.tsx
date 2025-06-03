// HomePage.native.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import { useNavigate } from "react-router-native";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  LucideGolf,
  Home,
  Dumbbell,
  Award,
  List,
  Brain,
} from "@/components/icons/CustomIcons";
import { useAuth } from "@/context/AuthContext";

interface QuickLink {
  title: string;
  icon: React.FC<{ size: number; color: string }>;
  description: string;
  path: string;
  backgroundColor: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const quickLinks: QuickLink[] = [
    {
      title: "Dashboard",
      icon: Home,
      description: "View your golf performance metrics",
      path: "/dashboard",
      backgroundColor: "#DBEAFE", // blue-100
    },
    {
      title: "Drills",
      icon: Dumbbell,
      description: "Practice drills to improve your game",
      path: "/drills",
      backgroundColor: "#DCFCE7", // green-100
    },
    {
      title: "Challenges",
      icon: Award,
      description: "Take on challenges to test your skills",
      path: "/challenges",
      backgroundColor: "#FEF9C3", // amber-100
    },
    {
      title: "Round Tracking",
      icon: List,
      description: "Log and analyze your rounds",
      path: "/rounds",
      backgroundColor: "#EDE9FE", // purple-100
    },
    {
      title: "AI Analysis",
      icon: Brain,
      description: "Get AI-powered insights for your game",
      path: "/ai-analysis",
      backgroundColor: "#E0E7FF", // indigo-100
    },
  ];

  const window = useWindowDimensions();
  const screenWidth = window.width;

  // Determine card width for Quick Access: 1 column if <600, 2 if <900, else 3
  const numColumns = screenWidth < 600 ? 1 : screenWidth < 900 ? 2 : 3;
  const GAP = 12;
  const H_PADDING = 16;
  const cardWidth =
    (screenWidth - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;

  // Layout for secondary section: 1 column if <800, else 2 columns
  const secondaryColumns = screenWidth < 800 ? 1 : 2;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoRow}>
            <LucideGolf size={40} color="#3B82F6" style={styles.logoIcon} />
            <Text style={styles.logoText}>ChipAway</Text>
          </View>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>
                {greeting}, {user?.email?.split("@")[0] || "Golfer"}
              </Text>
              <Text style={styles.subText}>
                Ready to improve your golf game today?
              </Text>
            </View>
            <Button
              style={styles.dashboardButton}
              onPress={() => navigate("/dashboard")}
            >
              <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
            </Button>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickLinks.map((link, index) => {
              const isLastInRow = (index + 1) % numColumns === 0;
              return (
                <TouchableOpacity
                  key={link.title}
                  onPress={() => navigate(link.path)}
                  style={[
                    styles.quickCardContainer,
                    {
                      width: cardWidth,
                      marginRight: isLastInRow ? 0 : GAP,
                      marginBottom: GAP,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Card style={{ backgroundColor: link.backgroundColor }}>
                    <CardHeader>
                      <View style={styles.cardHeaderRow}>
                        <link.icon size={24} color="#111827" />
                        <CardTitle style={styles.cardTitle}>
                          {link.title}
                        </CardTitle>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <Text style={styles.cardDescriptionText}>
                        {link.description}
                      </Text>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              );
            })}
            {/* Fill remaining spaces if last row is incomplete */}
            {quickLinks.length % numColumns !== 0 &&
              Array.from(
                { length: numColumns - (quickLinks.length % numColumns) },
                (_, idx) => (
                  <View
                    key={`spacer-${idx}`}
                    style={[
                      styles.quickCardContainer,
                      { width: cardWidth, marginRight: 0, marginBottom: GAP },
                    ]}
                  />
                )
              )}
          </View>
        </View>

        {/* Secondary Section */}
        <View style={styles.sectionContainer}>
          <View
            style={[
              styles.secondaryGrid,
              { flexDirection: secondaryColumns === 1 ? "column" : "row" },
            ]}
          >
            {/* Recent Progress */}
            <View
              style={[
                styles.secondaryCardWrapper,
                {
                  width:
                    secondaryColumns === 1
                      ? "100%"
                      : (screenWidth - H_PADDING * 2 - GAP) / 2,
                  marginRight: secondaryColumns === 1 ? 0 : GAP,
                  marginBottom: GAP,
                },
              ]}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Progress</CardTitle>
                  <CardDescription>Your golf journey at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <View style={styles.progressRow}>
                    <Text>Handicap</Text>
                    <Text style={styles.progressValue}>18.2</Text>
                  </View>
                  <View style={styles.progressRow}>
                    <Text>Best Round</Text>
                    <Text style={styles.progressValue}>83</Text>
                  </View>
                  <View style={styles.progressRow}>
                    <Text>Practice Hours</Text>
                    <Text style={styles.progressValue}>12 hrs this month</Text>
                  </View>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    style={styles.fullWidthButton}
                    onPress={() => navigate("/dashboard")}
                  >
                    <Text style={styles.buttonLabel}>View Full Dashboard</Text>
                  </Button>
                </CardFooter>
              </Card>
            </View>

            {/* AI Recommendation */}
            <View
              style={[
                styles.secondaryCardWrapper,
                {
                  width:
                    secondaryColumns === 1
                      ? "100%"
                      : (screenWidth - H_PADDING * 2 - GAP) / 2,
                  marginRight: 0,
                  marginBottom: GAP,
                },
              ]}
            >
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendation</CardTitle>
                  <CardDescription>Personalized tip for your game</CardDescription>
                </CardHeader>
                <CardContent>
                  <View style={styles.aiBox}>
                    <Text style={styles.aiTitle}>Putting Practice</Text>
                    <Text style={styles.aiText}>
                      Based on your recent rounds, try the "Clock Drill" to
                      improve your distance control on putts. This can help
                      reduce your three-putt frequency.
                    </Text>
                  </View>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    style={styles.fullWidthButton}
                    onPress={() => navigate("/ai-analysis")}
                  >
                    <Text style={styles.buttonLabel}>View All Insights</Text>
                  </Button>
                </CardFooter>
              </Card>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB", // bg-background
  },
  container: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  },
  subText: {
    fontSize: 14,
    color: "#6B7280", // muted-foreground
    marginTop: 4,
  },
  dashboardButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickCardContainer: {
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
  },
  cardDescriptionText: {
    fontSize: 14,
    color: "#6B7280",
  },
  secondaryGrid: {
    justifyContent: "space-between",
  },
  secondaryCardWrapper: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressValue: {
    fontWeight: "600",
  },
  fullWidthButton: {
    width: "100%",
    paddingVertical: 8,
  },
  buttonLabel: {
    color: "#3B82F6", // primary
    fontSize: 16,
    fontWeight: "600",
  },
  aiBox: {
    backgroundColor: "#E5E7EB", // muted/50
    padding: 12,
    borderRadius: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  aiText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
