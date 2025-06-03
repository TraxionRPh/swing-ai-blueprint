import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigate } from "react-router-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar, Plus, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Round {
  id: string;
  date: string;
  total_score: number | null;
  hole_count: number;
  course: {
    name: string;
    city: string;
    state: string;
  };
}

export const RoundsList = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRounds();
  }, [user]);

  const fetchRounds = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rounds")
        .select(
          `
          id,
          date,
          total_score,
          hole_count,
          golf_courses:course_id (
            name,
            city,
            state
          )
        `
        )
        .eq("user_id", user.id)
        .not("total_score", "is", null)
        .order("date", { ascending: false });

      if (error) throw error;

      const formattedRounds = data.map((round: any) => ({
        id: round.id,
        date: round.date,
        total_score: round.total_score,
        hole_count: round.hole_count || 18,
        course: {
          name: round.golf_courses?.name || "Unknown Course",
          city: round.golf_courses?.city || "",
          state: round.golf_courses?.state || "",
        },
      }));

      setRounds(formattedRounds);
    } catch (error) {
      console.error("Error fetching rounds:", error);
      toast({
        title: "Error loading rounds",
        description: "Could not load your rounds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRound = () => {
    navigate("/rounds/new");
  };

  const handleSelectRound = (roundId: string) => {
    navigate(`/rounds/${roundId}`);
  };

  if (isLoading) {
    return <LoadingState onBack={onBack} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RoundHeader
        title="Round History"
        subtitle="View your completed rounds"
        onBack={onBack}
      />

      <View style={styles.newButtonContainer}>
        <TouchableOpacity style={styles.newButton} onPress={handleCreateRound}>
          <Plus size={18} color="#fff" style={styles.plusIcon} />
          <Text style={styles.newButtonText}>New Round</Text>
        </TouchableOpacity>
      </View>

      {rounds.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            You haven't completed any rounds yet.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleCreateRound}
          >
            <Plus size={18} color="#fff" style={styles.plusIcon} />
            <Text style={styles.emptyButtonText}>Create Your First Round</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {rounds.map((round) => (
            <TouchableOpacity
              key={round.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handleSelectRound(round.id)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.courseName}>{round.course.name}</Text>
                  <Text style={styles.courseLocation}>
                    {round.course.city}, {round.course.state}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <View style={styles.dateRow}>
                    <Calendar size={16} color="#6B7280" style={styles.icon} />
                    <Text style={styles.dateText}>
                      {format(new Date(round.date), "MMM d, yyyy")}
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreText}>
                      {round.total_score} ({round.hole_count} holes)
                    </Text>
                    <ChevronRight
                      size={20}
                      color="#6B7280"
                      style={styles.icon}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  newButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  plusIcon: {
    marginRight: 6,
  },
  newButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardLeft: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  courseLocation: {
    fontSize: 14,
    color: "#6B7280",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginRight: 4,
  },
  icon: {
    marginRight: 2,
  },
});
