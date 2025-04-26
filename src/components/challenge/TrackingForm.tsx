
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { formSchema, FormSchema } from '@/hooks/useSubmitChallenge';

type TrackingFormProps = {
  onSubmit: (values: FormSchema) => Promise<void>;
  isPersisting: boolean;
};

export const TrackingForm = ({ onSubmit, isPersisting }: TrackingFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: '',
      notes: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Score</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 7 out of 10" {...field} />
              </FormControl>
              <FormDescription>
                Enter your performance result for this challenge
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes about your performance..." 
                  {...field}
                  className="min-h-[100px]" 
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isPersisting}
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
