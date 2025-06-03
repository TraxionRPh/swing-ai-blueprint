import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch as RNSwitch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigate, useLocation } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useRound } from "@/context/round";
import { Check, Loader2, AlertCircle } from "lucide-react-native";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { HoleData } from "@/types/round-tracking";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HoleScoringProps {
  onBack: () => void;
}

export const HoleScoring = ({ onBack }: HoleScoringProps) => {
  const { roundId, holeNumber } = useLocation().pathname
    .split("/")
    .slice(-2)
    .reduce<{ roundId: string; holeNumber: string }>(
      (acc, segment, idx, arr) =>
        idx === arr.length - 2
          ? { ...acc, roundId: segment }
          : { ...acc, holeNumber: segment },
      { roundId: "", holeNumber: "" }
    );
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentRoundId,
    setCurrentRoundId,
    holeScores,
    setCurrentHoleNumber,
    holeCount,
    updateHoleScore,
    isLoading,
    saveInProgress,
  } = useRound();

  const [currentHole, setCurrentHole] = useState<number>(1);
  const [holeData, setHoleData] = useState<HoleData>({
    holeNumber: 1,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    if (roundId && roundId !== "new") {
      setCurrentRoundId(roundId);
      try {
        sessionStorage.setItem("current-round-id", roundId);
        localStorage.setItem("current-round-id", roundId);
      } catch {
        // ignore
      }
    }
    if (holeNumber) {
      const parsed = parseInt(holeNumber, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setCurrentHole(parsed);
        setCurrentHoleNumber(parsed);
        try {
          sessionStorage.setItem("current-hole-number", parsed.toString());
          localStorage.setItem("current-hole-number", parsed.toString());
        } catch {
          // ignore
        }
      }
    }
  }, [roundId, holeNumber]);

  // Update holeData when scores or hole changes
  useEffect(() => {
    if (holeScores.length > 0 && currentHole > 0) {
      const hole = holeScores.find((h) => h.holeNumber === currentHole);
      if (hole) {
        setHoleData(hole);
      } else {
        setHoleData({
          holeNumber: currentHole,
          par: 4,
          distance: 0,
          score: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false,
        });
      }
    }
  }, [holeScores, currentHole]);

  const handleFieldUpdate = (field: keyof HoleData, value: any) => {
    setHoleData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const success = await updateHoleScore(holeData);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        return true;
      } else {
        setSaveError("Failed to save score");
        return false;
      }
    } catch {
      setSaveError("Error saving score");
      return false;
    }
  };

  const handleNext = async () => {
    const ok = await handleSave();
    if (!ok) return;
    if (currentHole < holeCount) {
      navigate(`/rounds/${roundId}/${currentHole + 1}`);
    } else {
      navigate(`/rounds/${roundId}/review`);
    }
  };

  const handlePrevious = async () => {
    const ok = await handleSave();
    if (!ok) return;
    if (currentHole > 1) {
      navigate(`/rounds/${roundId}/${currentHole - 1}`);
    }
  };

  const handleReview = async () => {
    const ok = await handleSave();
    if (!ok) return;
    navigate(`/rounds/${roundId}/review`);
  };

  const getRelationToPar = () => {
    const diff = holeData.score - holeData.par;
    if (diff === 0) return "Even";
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  const getScoreColors = () => {
    const diff = holeData.score - holeData.par;
    if (!holeData.score) return styles.scoreEven;
    if (diff === 0) return styles.scoreEven;
    if (diff < 0) return styles.scoreUnder;
    if (diff === 1) return styles.scoreBogey;
    return styles.scoreOver;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        holeData.score > 0 ||
        holeData.putts > 0 ||
        holeData.fairwayHit ||
        holeData.greenInRegulation
      ) {
        handleSave();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [holeData]);

  if (isLoading) {
    return (
      <LoadingState
        onBack={onBack}
        message={`Loading hole ${currentHole}...`}
      />
    );
  }

  const isFirstHole = currentHole === 1;
  const isLastHole = currentHole === holeCount;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RoundHeader
        title={`Hole ${currentHole}`}
        subtitle={`Par ${holeData.par} • ${
          holeData.distance > 0
            ? `${holeData.distance} yards`
            : "Distance not available"
        }`}
        onBack={onBack}
      />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Enter Score</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.holeInfoRow}>
            <Text style={styles.holeInfoText}>
              Hole {currentHole} of {holeCount}
            </Text>
            <View style={[styles.badge, getScoreColors()]}>
              <Text style={styles.badgeText}>
                {holeData.score
                  ? `${getRelationToPar()} (${holeData.score})`
                  : "No score"}
              </Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Score</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={holeData.score ? holeData.score.toString() : ""}
                onChangeText={(text) =>
                  handleFieldUpdate("score", parseInt(text, 10) || 0)
                }
                placeholder="0"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Putts</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={holeData.putts ? holeData.putts.toString() : ""}
                onChangeText={(text) =>
                  handleFieldUpdate("putts", parseInt(text, 10) || 0)
                }
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.parSelector}>
            <Text style={styles.label}>Par</Text>
            <View style={styles.parButtons}>
              {[3, 4, 5].map((par) => (
                <TouchableOpacity
                  key={par}
                  style={[
                    styles.parButton,
                    holeData.par === par && styles.parButtonSelected,
                  ]}
                  onPress={() => handleFieldUpdate("par", par)}
                >
                  <Text
                    style={[
                      styles.parButtonText,
                      holeData.par === par && styles.parButtonTextSelected,
                    ]}
                  >
                    Par {par}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.toggleGroup}>
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Fairway Hit</Text>
              <RNSwitch
                value={holeData.fairwayHit}
                onValueChange={(val) =>
                  handleFieldUpdate("fairwayHit", val)
                }
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Green in Regulation</Text>
              <RNSwitch
                value={holeData.greenInRegulation}
                onValueChange={(val) =>
                  handleFieldUpdate("greenInRegulation", val)
                }
              />
            </View>
          </View>

          <View style={styles.navigationRow}>
            <TouchableOpacity
              style={[
                styles.navButton,
                (isFirstHole || saveInProgress) && styles.disabledButton,
              ]}
              onPress={handlePrevious}
              disabled={isFirstHole || saveInProgress}
            >
              <Text
                style={[
                  styles.navButtonText,
                  (isFirstHole || saveInProgress) && styles.disabledText,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                (isLastHole || saveInProgress) && styles.disabledButton,
              ]}
              onPress={isLastHole ? handleReview : handleNext}
              disabled={saveInProgress}
            >
              <Text
                style={[
                  styles.navButtonText,
                  styles.nextButtonText,
                  saveInProgress && styles.disabledText,
                ]}
              >
                {isLastHole ? "Review Round" : "Next"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                (saveInProgress) && styles.disabledButton,
              ]}
              onPress={handleReview}
              disabled={saveInProgress}
            >
              <Text
                style={[
                  styles.navButtonText,
                  saveInProgress && styles.disabledText,
                ]}
              >
                Review All
              </Text>
            </TouchableOpacity>
          </View>

          {(saveInProgress || saveSuccess || saveError) && (
            <View
              style={[
                styles.saveStatus,
                saveInProgress
                  ? styles.statusSaving
                  : saveError
                  ? styles.statusError
                  : styles.statusSuccess,
              ]}
            >
              {saveInProgress && (
                <>
                  <Loader2
                    size={18}
                    color="#b45309"
                    style={styles.statusIcon}
                  />
                  <Text style={styles.statusText}>Saving your score...</Text>
                </>
              )}
              {saveError && (
                <>
                  <AlertCircle
                    size={18}
                    color="#b91c1c"
                    style={styles.statusIcon}
                  />
                  <Text style={styles.statusText}>{saveError}</Text>
                </>
              )}
              {saveSuccess && !saveInProgress && !saveError && (
                <>
                  <Check
                    size={18}
                    color="#15803d"
                    style={styles.statusIcon}
                  />
                  <Text style={styles.statusText}>
                    Score saved successfully
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  holeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  holeInfoText: {
    fontSize: 14,
    color: "#666",
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scoreEven: {
    backgroundColor: "#e5e7eb",
  },
  scoreUnder: {
    backgroundColor: "#d1fae5",
  },
  scoreBogey: {
    backgroundColor: "#fef3c7",
  },
  scoreOver: {
    backgroundColor: "#fee2e2",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  parSelector: {
    marginBottom: 12,
  },
  parButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  parButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
  },
  parButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  parButtonText: {
    fontSize: 16,
    color: "#333",
  },
  parButtonTextSelected: {
    color: "#fff",
    fontWeight: "500",
  },
  toggleGroup: {
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  nextButtonText: {
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#999",
  },
  saveStatus: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#333",
  },
  statusSaving: {
    backgroundColor: "#fef3c7",
  },
  statusError: {
    backgroundColor: "#fee2e2",
  },
  statusSuccess: {
    backgroundColor: "#d1fae5",
  },
});
