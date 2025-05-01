
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayIcon, PlusIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Round } from '@/types/round-tracking';

export const RoundsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [inProgressRounds, setInProgressRounds] = useState<Round[]>([]);
  const [completedRounds, setCompletedRounds] = useState<Round[]>([]);
  
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setIsLoading(true);
        
        // Fetch rounds that don't have a total score (in progress)
        const { data: inProgress, error: inProgressError } = await supabase
          .from('rounds')
          .select(`
            *,
            golf_courses:course_id (
              id, name, city, state
            )
          `)
          .is('total_score', null)
          .order('created_at', { ascending: false });
          
        if (inProgressError) throw inProgressError;
        
        // Fetch completed rounds (have a total score)
        const { data: completed, error: completedError } = await supabase
          .from('rounds')
          .select(`
            *,
            golf_courses:course_id (
              id, name, city, state
            )
          `)
          .not('total_score', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (completedError) throw completedError;
        
        // Format the data
        setInProgressRounds(inProgress?.map(round => ({
          ...round,
          course: round.golf_courses
        })) || []);
        
        setCompletedRounds(completed?.map(round => ({
          ...round,
          course: round.golf_courses
        })) || []);
        
      } catch (error) {
        console.error('Error fetching rounds:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your rounds',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRounds();
  }, [toast]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Rounds</h2>
        <Button onClick={() => navigate('/rounds/new')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Round
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="py-6">
            <div className="animate-pulse text-center">Loading rounds...</div>
          </CardContent>
        </Card>
      ) : (
        <>
          {inProgressRounds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inProgressRounds.map((round) => (
                    <div 
                      key={round.id} 
                      className="flex justify-between items-center p-4 border rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => navigate(`/rounds/${round.id}/1`)}
                    >
                      <div>
                        <h3 className="font-medium">{round.course?.name || 'Unknown Course'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Started {format(new Date(round.created_at || round.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button size="sm">
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {completedRounds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {completedRounds.map((round) => (
                    <div 
                      key={round.id} 
                      className="p-4 border rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => navigate(`/rounds/${round.id}`)}
                    >
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium">{round.course?.name || 'Unknown Course'}</h3>
                        <p className="text-sm font-bold">
                          {round.total_score}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(round.date), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {round.hole_count} holes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {inProgressRounds.length === 0 && completedRounds.length === 0 && (
            <Card>
              <CardContent className="py-6">
                <div className="text-center space-y-2">
                  <p>You haven't tracked any rounds yet</p>
                  <Button onClick={() => navigate('/rounds/new')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Track Your First Round
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
