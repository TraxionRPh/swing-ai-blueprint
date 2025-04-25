
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CourseFormData {
  name: string;
  address: string;
  courseRating: string;
  slopeRating: string;
  totalPar: string;
}

interface CourseFormProps {
  onCourseCreated: (course: any) => void;
  onCancel: () => void;
}

export const CourseForm = ({ onCourseCreated, onCancel }: CourseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<CourseFormData>({
    defaultValues: {
      name: "",
      address: "",
      courseRating: "",
      slopeRating: "",
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
          address: data.address,
          course_rating: parseFloat(data.courseRating),
          slope_rating: parseInt(data.slopeRating),
          total_par: parseInt(data.totalPar),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Course created",
        description: "The golf course has been added successfully.",
      });
      
      onCourseCreated(course);
    } catch (error) {
      toast({
        title: "Error creating course",
        description: "There was a problem adding the golf course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter course address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="courseRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Rating</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.1" placeholder="72.0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slopeRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slope Rating</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="113" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalPar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Par</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="72" />
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
            {isSubmitting ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
