
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeesForm } from "./TeesForm";
import { Card } from "@/components/ui/card";
import { CourseBasicInfoForm } from "./CourseBasicInfoForm";

interface CourseFormProps {
  onCourseCreated: (course: any) => void;
  onCancel: () => void;
}

export const CourseForm = ({ onCourseCreated, onCancel }: CourseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeesForm, setShowTeesForm] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBasicInfoSubmit = async (data: any) => {
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

  const handleTeesSubmit = async (tees: any) => {
    if (!courseId) return;

    try {
      const { error } = await supabase
        .from('course_tees')
        .insert(
          tees.map((tee: any) => ({
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
    <CourseBasicInfoForm
      onSubmit={handleBasicInfoSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
};
