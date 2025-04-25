import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeesForm } from "./TeesForm";
import { Card } from "@/components/ui/card";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface CourseFormData {
  name: string;
  city: string;
  state: string;
  totalPar: string;
}

interface TeeData {
  name: string;
  color: string;
  courseRating: string;
  slopeRating: string;
  totalYards: string;
}

interface CourseFormProps {
  onCourseCreated: (course: any) => void;
  onCancel: () => void;
}

export const CourseForm = ({ onCourseCreated, onCancel }: CourseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeesForm, setShowTeesForm] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<CourseFormData>({
    defaultValues: {
      name: "",
      city: "",
      state: "",
      totalPar: "",
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const { data: course, error } = await supabase
        .from('golf_courses')
        .insert({
          name: data.name,
          city: data.city,
          state: data.state.toUpperCase(),
          total_par: parseInt(data.totalPar),
        })
        .select()
        .single();

      if (error) throw error;

      setCourseId(course.id);
      setShowTeesForm(true);
      
      toast({
        title: "Course created",
        description: "Now let's add the tee information.",
      });
    } catch (error) {
      toast({
        title: "Error creating course",
        description: "There was a problem adding the golf course. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleTeesSubmit = async (tees: TeeData[]) => {
    if (!courseId) return;

    try {
      const { error } = await supabase
        .from('course_tees')
        .insert(
          tees.map(tee => ({
            course_id: courseId,
            name: tee.name,
            color: tee.color,
            course_rating: parseFloat(tee.courseRating),
            slope_rating: parseInt(tee.slopeRating),
            total_yards: parseInt(tee.totalYards),
          }))
        );

      if (error) throw error;

      toast({
        title: "Course and tees created",
        description: "The golf course has been added successfully with all tee information.",
      });
      
      const { data: course } = await supabase
        .from('golf_courses')
        .select(`
          *,
          course_tees (*)
        `)
        .eq('id', courseId)
        .single();

      onCourseCreated(course);
    } catch (error) {
      toast({
        title: "Error saving tees",
        description: "There was a problem adding the tee information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showTeesForm && courseId) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Add Tee Information</h2>
        <TeesForm onTeesSubmit={handleTeesSubmit} />
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Course name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter course name" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          rules={{ required: "City is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter city" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          rules={{ required: "State is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalPar"
          rules={{ 
            required: "Total par is required",
            validate: (value) => {
              const numValue = parseInt(value);
              return (numValue > 0 && numValue < 100) || "Invalid par value";
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Par</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="Enter total par (e.g., 72)" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Next: Add Tees"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
