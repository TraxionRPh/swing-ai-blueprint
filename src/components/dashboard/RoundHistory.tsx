
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const RoundHistory = () => {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRounds = async () => {
      if (!user) return;
      
      console.log("RoundHistory: Fetching rounds for user:", user.id);
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          id,
          total_score,
          date,
          hole_count,
          golf_courses (
            name,
            city,
            state
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      console.log("RoundHistory: Rounds data received:", data, "Error:", error);

      if (!error && data) {
        setRounds(data);
      }
      setLoading(false);
    };

    fetchRounds();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Rounds</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading rounds...</p>
          </div>
        ) : rounds.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map((round) => (
                <TableRow key={round.id}>
                  <TableCell>
                    {new Date(round.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {round.golf_courses?.name} - {round.golf_courses?.city}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {round.total_score || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No rounds found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
