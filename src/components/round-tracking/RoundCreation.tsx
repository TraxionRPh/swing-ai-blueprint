import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigate } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useRound } from "@/context/round";
import { useCreateRound } from "@/context/round/operations/createRound";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RoundCreationProps {
  onBack: () => void;
  holeCount?: number;
}

export const RoundCreation = ({
  onBack,
  holeCount = 18,
}: RoundCreationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCourse, selectedTeeId, setHoleCount } = useRound();
  const { createRound, isCreating } = useCreateRound();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHoleCount(holeCount);
    console.log("Setting hole count in context:", holeCount);
  }, [holeCount, setHoleCount]);

  const startRound = async () => {
    if (!selectedCourse?.id) {
      toast({
        title: "No Course Selected",
        description: "Please select a course to track a round",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log(
        `Starting round with course: ${selectedCourse.name}, tee: ${selectedTeeId}, holes: ${holeCount}`
      );

      const roundId = await createRound(
        selectedCourse.id,
        selectedTeeId,
        holeCount
      );

      if (roundId) {
        console.log(
          `Round created with ID: ${roundId}, navigating to hole 1`
        );
        navigate(`/rounds/track/${roundId}/1`);
      } else {
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error starting round:", error);
      toast({
        title: "Error",
        description: "Could not start round tracking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.courseInfo}>
        {selectedCourse ? (
          <>
            <Text style={styles.courseName}>{selectedCourse.name}</Text>
            <Text style={styles.courseLocation}>
              {selectedCourse.city}, {selectedCourse.state}
            </Text>
            <Text style={styles.courseHoles}>{holeCount}-hole round</Text>
          </>
        ) : (
          <Text style={styles.noCourseText}>No course selected.</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          (isCreating || loading) && styles.disabledButton,
        ]}
        onPress={startRound}
        disabled={isCreating || loading}
      >
        {isCreating || loading ? (
          <>
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.spinner}
            />
            <Text style={styles.buttonText}>Starting Round...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Start Round</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  courseInfo: {
    marginBottom: 32,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  courseHoles: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  noCourseText: {
    fontSize: 16,
    color: "#6B7280",
  },
  startButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: SCREEN_WIDTH - 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  spinner: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
