
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { formSchema, FormSchema } from '@/hooks/useSubmitChallenge';

type TrackingFormProps = {
  onSubmit: (values: FormSchema) => Promise<void>;
  isPersisting: boolean;
  totalAttempts?: number;
};

export const TrackingForm = ({ onSubmit, isPersisting, totalAttempts }: TrackingFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: '',
    },
  });

  const currentScore = form.watch('score');
  const scoreNum = parseInt(currentScore, 10);
  const successPercentage = !isNaN(scoreNum) && totalAttempts 
    ? Math.round((scoreNum / totalAttempts) * 100) 
    : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Score (out of {totalAttempts || '?'})</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="0"
                  max={totalAttempts}
                  placeholder={`Enter score (0-${totalAttempts || '?'})`}
                  {...field} 
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Enter how many successful attempts you had</span>
                {successPercentage !== null && (
                  <span className="font-medium">
                    Success rate: {successPercentage}%
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isPersisting || (totalAttempts ? parseInt(form.watch('score'), 10) > totalAttempts : false)}
        >
          {isPersisting ? (
            <Loading message="Saving..." />
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Complete Challenge
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
