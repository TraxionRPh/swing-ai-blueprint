import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigate, useParams } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HoleData } from "@/types/round-tracking";
import { useRound } from "@/context/round";

// Import RN-compatible versions of these custom components
import { RoundStatsSummary } from "./hole/RoundStatsSummary";
import { HoleHeader } from "./hole/HoleHeader";
import { HoleInputForm } from "./hole/HoleInputForm";
import { HoleFooterActions } from "./hole/HoleFooterActions";
import { Separator } from "@/components/ui/Separator";
import { Loading } from "@/components/ui/Loading";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const HoleTracking = () => {
  const { roundId = "", holeNumber: holeNumberParam = "1" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const roundContext = useRound();

  const [currentHole, setCurrentHole] = useState<number>(
    parseInt(holeNumberParam, 10)
  );
  const [holeCount, setHoleCount] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<{
    name: string;
    city: string;
    state: string;
    par?: number;
  } | null>(null);
  const [allHoleScores, setAllHoleScores] = useState<HoleData[]>([]);

  const [holeData, setHoleData] = useState<HoleData>({
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false,
  });

  // Compute round stats based on allHoleScores + holeData
  const roundStats = useMemo(() => {
    const allScores = [...allHoleScores];
    const idx = allScores.findIndex((h) => h.holeNumber === currentHole);
    if (idx >= 0) {
      allScores[idx] = holeData;
    } else if (
      holeData.score ||
      holeData.putts ||
      holeData.fairwayHit ||
      holeData.greenInRegulation
    ) {
      allScores.push(holeData);
    }

    const fairwayEligible = allScores.filter((h) => h.par && h.par > 3);
    const fairwaysHit = fairwayEligible.filter((h) => h.fairwayHit).length;
    const totalFairways = fairwayEligible.length;

    return {
      totalStrokes: allScores.reduce((sum, h) => sum + (h.score || 0), 0),
      totalPutts: allScores.reduce((sum, h) => sum + (h.putts || 0), 0),
      fairwaysHit,
      totalFairways,
      greensInRegulation: allScores.filter((h) => h.greenInRegulation).length,
      totalGreens: allScores.length,
    };
  }, [allHoleScores, holeData, currentHole]);

  // Load round info on mount
  useEffect(() => {
    if (roundId) {
      loadRoundInfo();
      loadHoleInfo(currentHole);
    }
  }, [roundId]);

  // Update when holeNumberParam changes
  useEffect(() => {
    const parsed = parseInt(holeNumberParam, 10);
    if (!isNaN(parsed) && parsed !== currentHole) {
      setCurrentHole(parsed);
      loadHoleInfo(parsed);
    }
  }, [holeNumberParam]);

  const loadRoundInfo = async () => {
    try {
      setIsLoading(true);
      if (!roundId) return;

      const { data: roundData, error: roundError } = await supabase
        .from("rounds")
        .select("hole_count, course_id")
        .eq("id", roundId)
        .single();

      if (roundError) throw roundError;
      if (roundData) {
        const actualHoleCount = roundData.hole_count || 18;
        setHoleCount(actualHoleCount);

        const { data: courseData, error: courseError } = await supabase
          .from("golf_courses")
          .select("name, city, state")
          .eq("id", roundData.course_id)
          .single();

        if (courseError) throw courseError;
        setCourseDetails(courseData || null);

        const { data: allScores, error: allScoresError } = await supabase
          .from("hole_scores")
          .select("*")
          .eq("round_id", roundId);

        if (!allScoresError && allScores) {
          const formatted: HoleData[] = allScores.map((h) => ({
            holeNumber: h.hole_number,
            par: 4,
            distance: 0,
            score: h.score || 0,
            putts: h.putts || 0,
            fairwayHit: !!h.fairway_hit,
            greenInRegulation: !!h.green_in_regulation,
          }));
          setAllHoleScores(formatted);
        }
      }
    } catch (error) {
      console.error("Error loading round info:", error);
      toast({
        title: "Error loading round",
        description: "Could not load round information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHoleInfo = async (holeNum: number) => {
    try {
      const { data: holeScoreData, error: holeScoreError } = await supabase
        .from("hole_scores")
        .select("*")
        .eq("round_id", roundId)
        .eq("hole_number", holeNum)
        .single();

      if (holeScoreError && holeScoreError.code !== "PGRST116") {
        throw holeScoreError;
      }

      const { data: roundData } = await supabase
        .from("rounds")
        .select("course_id")
        .eq("id", roundId)
        .single();

      if (roundData?.course_id) {
        const { data: holeInfo } = await supabase
          .from("course_holes")
          .select("par, distance_yards")
          .eq("course_id", roundData.course_id)
          .eq("hole_number", holeNum)
          .single();

        setHoleData((prev) => ({
          ...prev,
          holeNumber: holeNum,
          par: holeInfo?.par || 4,
          distance: holeInfo?.distance_yards || 0,
          score: holeScoreData?.score || 0,
          putts: holeScoreData?.putts || 0,
          fairwayHit: holeScoreData?.fairway_hit || false,
          greenInRegulation: holeScoreData?.green_in_regulation || false,
        }));
      } else {
        setHoleData((prev) => ({
          ...prev,
          holeNumber: holeNum,
          score: holeScoreData?.score || 0,
          putts: holeScoreData?.putts || 0,
          fairwayHit: holeScoreData?.fairway_hit || false,
          greenInRegulation: holeScoreData?.green_in_regulation || false,
        }));
      }
    } catch (error) {
      console.error(`Error loading hole ${holeNum} info:`, error);
    }
  };

  const saveHoleData = async () => {
    if (!roundId || !holeData.score) {
      toast({
        title: "Score required",
        description: "Please enter a score before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("hole_scores")
        .upsert(
          {
            round_id: roundId,
            hole_number: currentHole,
            score: holeData.score || 0,
            putts: holeData.putts || 0,
            fairway_hit: holeData.fairwayHit,
            green_in_regulation: holeData.greenInRegulation,
          },
          { onConflict: "round_id,hole_number" }
        );

      if (error) throw error;

      setAllHoleScores((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((h) => h.holeNumber === currentHole);
        if (idx >= 0) {
          updated[idx] = holeData;
        } else {
          updated.push(holeData);
        }
        return updated;
      });

      toast({
        title: "Score saved",
        description: `Hole ${currentHole} score saved successfully`,
      });

      if (currentHole === holeCount) {
        navigate(`/rounds/review/${roundId}`);
      } else {
        navigate(`/rounds/track/${roundId}/${currentHole + 1}`);
      }
    } catch (error) {
      console.error("Error saving hole data:", error);
      toast({
        title: "Error saving score",
        description: "Could not save your score",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goToPreviousHole = () => {
    if (currentHole > 1) {
      navigate(`/rounds/track/${roundId}/${currentHole - 1}`);
    }
  };

  const handleInputChange = (field: keyof HoleData, value: any) => {
    setHoleData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (text: string) => {
    if (text === "" || (/^\d+$/.test(text) && parseInt(text, 10) > 0)) {
      handleInputChange("score", text === "" ? 0 : parseInt(text, 10));
    }
  };

  const handlePuttsChange = (text: string) => {
    if (text === "" || (/^\d+$/.test(text) && parseInt(text, 10) >= 0)) {
      handleInputChange("putts", text === "" ? 0 : parseInt(text, 10));
    }
  };

  const handleDistanceChange = (text: string) => {
    if (text === "" || (/^\d+$/.test(text) && parseInt(text, 10) >= 0)) {
      handleInputChange("distance", text === "" ? 0 : parseInt(text, 10));
    }
  };

  const handleParChange = (par: number) => {
    handleInputChange("par", par);
  };

  // Auto-save after a short delay when holeData changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        holeData.score > 0 ||
        holeData.putts > 0 ||
        holeData.fairwayHit ||
        holeData.greenInRegulation
      ) {
        saveHoleData();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [holeData]);

  if (isLoading) {
    return <Loading size="lg" message="Loading hole information..." />;
  }

  const isFirstHole = currentHole === 1;
  const isLastHole = currentHole === holeCount;

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hole {currentHole}</Text>
        <Text style={styles.headerSubtitle}>
          {courseDetails?.name || "Loading course..."} – {holeCount} holes
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <RoundStatsSummary
            totalStrokes={roundStats.totalStrokes}
            totalPutts={roundStats.totalPutts}
            fairwaysHit={roundStats.fairwaysHit}
            totalFairways={roundStats.totalFairways}
            greensInRegulation={roundStats.greensInRegulation}
            totalGreens={roundStats.totalGreens}
          />

          <Separator />

          <View style={styles.holeSection}>
            <HoleHeader
              currentHole={currentHole}
              holeCount={holeCount}
              par={holeData.par}
              onParChange={handleParChange}
              goToPreviousHole={goToPreviousHole}
            />

            <HoleInputForm
              holeData={holeData}
              handleDistanceChange={handleDistanceChange}
              handleScoreChange={handleScoreChange}
              handlePuttsChange={handlePuttsChange}
              handleInputChange={handleInputChange}
            />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <HoleFooterActions
            isSaving={isSaving}
            currentHole={currentHole}
            holeCount={holeCount}
            hasScore={!!holeData.score}
            onCancel={() => navigate("/rounds")}
            onSave={saveHoleData}
          />
        </View>
      </View>

      {(isSaving || holeData.score > 0) && (
        <View
          style={[
            styles.saveStatus,
            isSaving
              ? styles.statusSaving
              : holeData.score
              ? styles.statusSuccess
              : styles.statusError,
          ]}
        >
          {isSaving && (
            <>
              <Loader2 size={18} color="#b45309" style={styles.statusIcon} />
              <Text style={styles.statusText}>Saving your score...</Text>
            </>
          )}
          {!isSaving && holeData.score > 0 && (
            <>
              <Check size={18} color="#15803d" style={styles.statusIcon} />
              <Text style={styles.statusText}>
                Score saved successfully
              </Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
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
    padding: 16,
  },
  holeSection: {
    marginTop: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
  },
  saveStatus: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    marginTop: 16,
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
});
