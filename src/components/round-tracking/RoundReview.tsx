
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HoleData } from "@/types/round-tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loading } from "@/components/ui/loading";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Confetti from "react-confetti";

interface RoundStats {
  totalScore: number;
  totalPutts: number;
  fairwaysHit: number;
  greensInRegulation: number;
  totalHoles: number;
  parTotal: number;
  courseName: string;
  date: string;
  fairwayEligibleHoles: number; // Add this property to track holes eligible for FIR
}

const RoundReview = () => {
  const navigate = useNavigate();
  const { roundId } = useParams<{ roundId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [roundStats, setRoundStats] = useState<RoundStats>({
    totalScore: 0,
    totalPutts: 0,
    fairwaysHit: 0,
    greensInRegulation: 0,
    totalHoles: 0,
    parTotal: 0,
    courseName: "",
    date: new Date().toLocaleDateString(),
    fairwayEligibleHoles: 0 // Initialize fairwayEligibleHoles
  });
  
  // Load round review data
  useEffect(() => {
    if (roundId) {
      loadRoundData();
    }
  }, [roundId]);
  
  // Check if we should show congratulations
  useEffect(() => {
    checkForAchievements();
  }, [roundStats]);
  
  // Load round data from database
  const loadRoundData = async () => {
    try {
      setIsLoading(true);
      
      // Get round details
      const { data: roundData, error: roundError } = await supabase
        .from("rounds")
        .select("hole_count, course_id, date")
        .eq("id", roundId)
        .single();
      
      if (roundError) throw roundError;
      
      // Get hole scores
      const { data: holeScoresData, error: scoresError } = await supabase
        .from("hole_scores")
        .select("*")
        .eq("round_id", roundId)
        .order("hole_number");
      
      if (scoresError) throw scoresError;
      
      // Get course information
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .select("name, total_par")
        .eq("id", roundData.course_id)
        .single();
      
      if (courseError) throw courseError;
      
      // Get course holes information
      const { data: courseHolesData } = await supabase
        .from("course_holes")
        .select("hole_number, par")
        .eq("course_id", roundData.course_id)
        .order("hole_number");
      
      // Combine hole data with scores
      const holeDataWithScores: HoleData[] = [];
      
      for (let i = 1; i <= roundData.hole_count; i++) {
        const scoreData = holeScoresData?.find(s => s.hole_number === i);
        const holeInfo = courseHolesData?.find(h => h.hole_number === i);
        
        if (scoreData) {
          holeDataWithScores.push({
            holeNumber: i,
            par: holeInfo?.par || 4,
            distance: 0, // Not showing distance in review
            score: scoreData.score || 0,
            putts: scoreData.putts || 0,
            fairwayHit: scoreData.fairway_hit || false,
            greenInRegulation: scoreData.green_in_regulation || false,
          });
        }
      }
      
      setHoleScores(holeDataWithScores);
      
      // Calculate stats
      if (holeDataWithScores.length > 0) {
        // Filter out par 3s for fairway calculation
        const fairwayEligibleHoles = holeDataWithScores.filter(h => h.par && h.par > 3);
        const fairwaysHit = fairwayEligibleHoles.filter(h => h.fairwayHit).length;
        const fairwayEligibleCount = fairwayEligibleHoles.length;
        const totalScore = holeDataWithScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
        const totalPutts = holeDataWithScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
        const greensInRegulation = holeDataWithScores.filter(h => h.greenInRegulation).length;
        const parTotal = holeDataWithScores.reduce((sum, hole) => sum + (hole.par || 0), 0);
        
        setRoundStats({
          totalScore,
          totalPutts,
          fairwaysHit,
          greensInRegulation,
          totalHoles: holeDataWithScores.length,
          parTotal,
          courseName: courseData?.name || "Unknown Course",
          date: new Date(roundData.date).toLocaleDateString(),
          fairwayEligibleHoles: fairwayEligibleCount // Set the count of holes eligible for fairway stats
        });
      }
    } catch (error) {
      console.error("Error loading round data:", error);
      toast({
        title: "Error loading round",
        description: "Could not load round information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user has achieved their goal
  const checkForAchievements = async () => {
    if (!user || roundStats.totalHoles !== 18) return;
    
    try {
      // Get user's score goal
      const { data: profileData } = await supabase
        .from("profiles")
        .select("score_goal")
        .eq("id", user.id)
        .single();
      
      // Get all previous rounds to compare
      const { data: previousRounds } = await supabase
        .from("rounds")
        .select("total_score")
        .eq("user_id", user.id)
        .neq("id", roundId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      // Check if this is a personal best
      const previousBest = previousRounds?.length 
        ? Math.min(...previousRounds.filter(r => r.total_score).map(r => r.total_score))
        : 999;
      
      // If user has a score goal and achieved it, or if this is a personal best
      if ((profileData?.score_goal && roundStats.totalScore <= profileData.score_goal) || 
          (roundStats.totalScore < previousBest)) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };
  
  // Submit and complete the round
  const completeRound = async () => {
    if (!roundId) return;
    
    try {
      setIsSaving(true);
      
      // Update round with totals
      const { error } = await supabase
        .from("rounds")
        .update({
          total_score: roundStats.totalScore,
          total_putts: roundStats.totalPutts,
          fairways_hit: roundStats.fairwaysHit,
          greens_in_regulation: roundStats.greensInRegulation,
          updated_at: new Date().toISOString()
        })
        .eq("id", roundId);
      
      if (error) throw error;
      
      // Clean up session storage
      try {
        sessionStorage.removeItem("current-round-id");
        sessionStorage.removeItem("selected-hole-count");
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
      
      toast({
        title: "Round Completed",
        description: `Your ${roundStats.totalHoles}-hole round has been saved`,
      });
      
      // Navigate to rounds dashboard
      navigate("/rounds");
    } catch (error) {
      console.error("Error completing round:", error);
      toast({
        title: "Error saving round",
        description: "Could not save round information",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <Loading size="lg" message="Loading round summary..." />;
  }
  
  return (
    <div className="space-y-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Round Review</h1>
        <p className="text-muted-foreground">
          Review and submit your {roundStats.totalHoles}-hole round
        </p>
      </div>
      
      {/* Round Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Round Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground text-sm">Total Score</p>
              <p className="text-3xl font-bold">{roundStats.totalScore}</p>
              <p className="text-sm">{roundStats.totalScore - roundStats.parTotal >= 0 ? "+" : ""}{roundStats.totalScore - roundStats.parTotal} to Par</p>
            </div>
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground text-sm">Total Putts</p>
              <p className="text-3xl font-bold">{roundStats.totalPutts}</p>
              <p className="text-sm">{(roundStats.totalPutts / roundStats.totalHoles).toFixed(1)} per hole</p>
            </div>
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground text-sm">Fairways Hit</p>
              <p className="text-3xl font-bold">{roundStats.fairwaysHit}</p>
              <p className="text-sm">{roundStats.fairwayEligibleHoles > 0 ? 
                Math.round((roundStats.fairwaysHit / roundStats.fairwayEligibleHoles) * 100) : 0}%</p>
            </div>
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground text-sm">Greens in Reg.</p>
              <p className="text-3xl font-bold">{roundStats.greensInRegulation}</p>
              <p className="text-sm">{Math.round((roundStats.greensInRegulation / roundStats.totalHoles) * 100)}%</p>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <h3 className="text-lg font-medium">{roundStats.courseName}</h3>
            <p className="text-sm text-muted-foreground">{roundStats.date}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Hole by Hole Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hole by Hole Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hole</TableHead>
                <TableHead>Par</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Putts</TableHead>
                <TableHead className="hidden md:table-cell">Fairway</TableHead>
                <TableHead className="hidden md:table-cell">GIR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holeScores.map(hole => (
                <TableRow key={hole.holeNumber}>
                  <TableCell>{hole.holeNumber}</TableCell>
                  <TableCell>{hole.par}</TableCell>
                  <TableCell className={
                    hole.score < hole.par ? "text-green-600 font-medium" : 
                    hole.score > hole.par ? "text-red-600 font-medium" : 
                    "font-medium"
                  }>
                    {hole.score}
                  </TableCell>
                  <TableCell>{hole.putts}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {hole.par > 3 ? 
                      (hole.fairwayHit ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        "-") : 
                      "N/A"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {hole.greenInRegulation ? <CheckCircle className="h-4 w-4 text-green-500" /> : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {holeScores.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
              <p>No hole scores found for this round.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/rounds/track/${roundId}/${roundStats.totalHoles}`)}
          >
            Back to Scoring
          </Button>
          <Button 
            onClick={completeRound} 
            disabled={isSaving || holeScores.length === 0}
          >
            {isSaving ? <Loading size="sm" message="Saving..." inline /> : "Complete Round"}
          </Button>
        </CardFooter>
      </Card>
      
      {showConfetti && (
        <Card className="border-green-500">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-700">Congratulations!</h3>
              <p className="mt-2">
                You've achieved a new personal best score. Keep up the great work!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoundReview;
