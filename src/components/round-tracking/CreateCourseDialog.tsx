
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CourseBasicInfoForm } from "./CourseBasicInfoForm";
import { TeesForm } from "./TeesForm";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: () => void;
}

type CourseCreationStep = "basic-info" | "tees";

interface CourseBasicInfo {
  name: string;
  city: string;
  state: string;
  totalPar: string;
}

interface CourseTee {
  id?: string;
  name: string;
  color: string;
  course_rating: string;
  slope_rating: string;
}

export function CreateCourseDialog({ open, onOpenChange, onCourseCreated }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState<CourseCreationStep>("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseBasicInfo, setCourseBasicInfo] = useState<CourseBasicInfo | null>(null);
  const [newCourseId, setNewCourseId] = useState<string | null>(null);
  
  // Reset the form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("basic-info");
      setCourseBasicInfo(null);
      setNewCourseId(null);
    }
    onOpenChange(open);
  };
  
  const handleBasicInfoSubmit = async (data: CourseBasicInfo) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a course",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Insert the new course into the database
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .insert({
          name: data.name,
          city: data.city,
          state: data.state,
          total_par: parseInt(data.totalPar),
          is_verified: false,
          verified_by: user.id
        })
        .select("id")
        .single();
      
      if (courseError) throw courseError;
      
      // Store the course ID and basic info for the next step
      setNewCourseId(courseData.id);
      setCourseBasicInfo(data);
      
      // Move to the tees step
      setStep("tees");
      
      toast({
        title: "Course created",
        description: "Now let's add some tees to your course",
      });
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Failed to create course",
        description: "There was an error creating the course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTeesSubmit = async (tees: CourseTee[]) => {
    if (!newCourseId || !user) {
      toast({
        title: "Error",
        description: "Course ID or user not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format the tees data for insertion
      const teesToInsert = tees.map(tee => ({
        course_id: newCourseId,
        name: tee.name,
        color: tee.color,
        course_rating: parseFloat(tee.course_rating),
        slope_rating: parseInt(tee.slope_rating)
      }));
      
      // Insert the tees
      const { error: teesError } = await supabase
        .from("course_tees")
        .insert(teesToInsert);
      
      if (teesError) throw teesError;
      
      // Close the dialog and refresh the course list
      handleOpenChange(false);
      
      // Call the onCourseCreated callback if provided
      if (onCourseCreated) {
        onCourseCreated();
      }
      
      toast({
        title: "Course created successfully",
        description: `${courseBasicInfo?.name} has been added to the course list`,
      });
    } catch (error) {
      console.error("Error adding tees:", error);
      toast({
        title: "Failed to add tees",
        description: "There was an error adding tees to the course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    // If we already created the course but are canceling tee creation,
    // we should still close the dialog but inform the user
    if (newCourseId && step === "tees") {
      toast({
        title: "Course saved without tees",
        description: "You can add tees to this course later",
      });
    }
    
    handleOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "basic-info" ? "Add New Course" : "Add Tees"}
          </DialogTitle>
          <DialogDescription>
            {step === "basic-info" 
              ? "Enter the basic information about the golf course" 
              : "Add tee information for different sets of tees at this course"
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === "basic-info" ? (
          <CourseBasicInfoForm 
            onSubmit={handleBasicInfoSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        ) : (
          <TeesForm 
            courseId={newCourseId || ""}
            onSubmit={handleTeesSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
