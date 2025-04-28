
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const RoundHistory = () => {
  const [rounds, setRounds] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRounds = async () => {
      if (!user) return;
      
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

      if (!error && data) {
        setRounds(data);
      }
    };

    fetchRounds();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Rounds</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
