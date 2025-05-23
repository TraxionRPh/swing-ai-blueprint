
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ScoringMetric {
  name: string;
  value: number;
  change: number;
  target: number;
  isGood: boolean;
}

export const useScoringBreakdown = () => {
  const [metrics, setMetrics] = useState<ScoringMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchScoringData = async () => {
      if (!user) {
        setIsUsingFallbackData(true);
        setIsLoading(false);
        return;
      }

      try {
        // Get the last 5 rounds for the user
        const { data: rounds, error: roundsError } = await supabase
          .from('rounds')
          .select(`
            id,
            total_score,
            fairways_hit,
            greens_in_regulation,
            total_putts,
            hole_count
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (roundsError) {
          console.error('Error fetching rounds:', roundsError);
          setError(roundsError.message);
          setIsUsingFallbackData(true);
          setIsLoading(false);
          return;
        }

        // Check if we have enough round data
        if (!rounds || rounds.length < 2) {
          console.log('Not enough rounds data for scoring breakdown');
          setIsUsingFallbackData(true);
          setIsLoading(false);
          return;
        }

        // Calculate metrics from rounds data
        const calculateFairwaysHitPercentage = () => {
          const fairwayRounds = rounds.filter(r => r.fairways_hit !== null);
          if (fairwayRounds.length === 0) return null;
          
          const totalPossibleFairways = fairwayRounds.reduce((acc, round) => {
            // Assuming ~14 fairways for 18 holes, ~7 for 9 holes
            return acc + (round.hole_count === 18 ? 14 : 7);
          }, 0);
          
          const totalFairwaysHit = fairwayRounds.reduce((acc, round) => acc + (round.fairways_hit || 0), 0);
          
          return totalPossibleFairways > 0 ? (totalFairwaysHit / totalPossibleFairways) * 100 : null;
        };

        const calculateGIRPercentage = () => {
          const girRounds = rounds.filter(r => r.greens_in_regulation !== null);
          if (girRounds.length === 0) return null;
          
          const totalPossibleGreens = girRounds.reduce((acc, round) => acc + round.hole_count, 0);
          const totalGreensHit = girRounds.reduce((acc, round) => acc + (round.greens_in_regulation || 0), 0);
          
          return totalPossibleGreens > 0 ? (totalGreensHit / totalPossibleGreens) * 100 : null;
        };

        const calculateAveragePutts = () => {
          const puttRounds = rounds.filter(r => r.total_putts !== null);
          if (puttRounds.length === 0) return null;
          
          const totalHoles = puttRounds.reduce((acc, round) => acc + round.hole_count, 0);
          const totalPutts = puttRounds.reduce((acc, round) => acc + (round.total_putts || 0), 0);
          
          return totalHoles > 0 ? totalPutts / (totalHoles / 18) : null;
        };

        // Calculate metrics
        const fairwaysHitPercentage = calculateFairwaysHitPercentage();
        const girPercentage = calculateGIRPercentage();
        const averagePutts = calculateAveragePutts();

        // Previous values (could be calculated more accurately with older rounds)
        // For now we'll just use small improvements as the change
        const calculateMetrics = (): ScoringMetric[] => {
          const result: ScoringMetric[] = [];
          
          if (fairwaysHitPercentage !== null) {
            result.push({
              name: "Fairways Hit",
              value: parseFloat(fairwaysHitPercentage.toFixed(1)),
              change: 2.0, // Placeholder change value
              target: 60,
              isGood: fairwaysHitPercentage >= 60 // Good if >= 60%
            });
          }
          
          if (girPercentage !== null) {
            result.push({
              name: "Greens in Regulation",
              value: parseFloat(girPercentage.toFixed(1)),
              change: 5.0, // Placeholder change value
              target: 60,
              isGood: girPercentage >= 50 // Good if >= 50%
            });
          }
          
          if (averagePutts !== null) {
            result.push({
              name: "Average Putts per Round",
              value: parseFloat(averagePutts.toFixed(1)),
              change: -0.6, // Negative means improvement for putts
              target: 32,
              isGood: averagePutts < 32 // Good if < 32 putts
            });
          }
          
          return result;
        };

        const calculatedMetrics = calculateMetrics();
        
        if (calculatedMetrics.length === 0) {
          console.log('No metrics could be calculated from rounds data');
          setIsUsingFallbackData(true);
          setIsLoading(false);
          return;
        }
        
        setMetrics(calculatedMetrics);
        setIsUsingFallbackData(false);
      } catch (err) {
        console.error('Error calculating scoring breakdown:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsUsingFallbackData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoringData();
  }, [user]);

  // Fallback data
  const getFallbackData = (): ScoringMetric[] => {
    return [
      {
        name: "Fairways Hit",
        value: 64,
        change: 2,
        target: 60,
        isGood: true
      },
      {
        name: "Greens in Regulation",
        value: 48,
        change: 5,
        target: 60,
        isGood: false
      },
      {
        name: "Average Putts per Round",
        value: 31.4,
        change: -0.6,
        target: 32,
        isGood: true
      }
    ];
  };

  return {
    metrics: metrics.length > 0 ? metrics : getFallbackData(),
    isLoading,
    error,
    isUsingFallbackData
  };
};
