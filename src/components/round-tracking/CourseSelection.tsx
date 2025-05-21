
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseTee } from "@/types/round-tracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { TeeSelection } from "./TeeSelection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeesForm } from "./TeesForm";
import { useCourseSelection } from "@/hooks/round-tracking/useCourseSelection";
import { useRound } from "@/context/round";

const CourseSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    filteredCourses, 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    hasError,
    refreshCourses 
  } = useCourseSelection();

  // Add useRound hook for context integration - renaming variables to avoid conflicts
  const { 
    setSelectedCourse: setContextSelectedCourse, 
    setSelectedTeeId: setContextSelectedTeeId, 
    setHoleCount: setContextHoleCount, 
    createRound 
  } = useRound();
  
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [selectedHoleCount, setSelectedHoleCount] = useState<number>(18);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showTeeDialog, setShowTeeDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle course card click
  const handleCourseClick = (courseId: string, course: Course) => {
    if (expandedCourseId === courseId) {
      // If already expanded, collapse it
      setExpandedCourseId(null);
      setSelectedCourse(null);
      setSelectedTeeId(null);
    } else {
      // Expand this course
      setExpandedCourseId(courseId);
      setSelectedCourse(course);
      
      // Auto-select first tee if available
      if (course.course_tees && course.course_tees.length > 0) {
        setSelectedTeeId(course.course_tees[0].id);
      } else {
        setSelectedTeeId(null);
      }
    }
  };
  
  // Handle adding a new tee
  const handleAddTee = (course: Course) => {
    setCurrentCourse(course);
    setShowTeeDialog(true);
  };
  
  // Handle tee submission
  const handleTeeSubmit = async (teeData: any) => {
    if (!currentCourse) return;
    
    try {
      // Add loading state or toast notification here if desired
      
      // Insert new tee into database
      const { data: newTee, error } = await supabase
        .from("course_tees")
        .insert({
          course_id: currentCourse.id,
          name: teeData[0].name,
          color: teeData[0].color,
          course_rating: teeData[0].courseRating || null,
          slope_rating: teeData[0].slopeRating || null,
          total_yards: teeData[0].totalYards || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Tee added successfully",
        description: `${newTee.name} tee has been added to ${currentCourse.name}`,
      });
      
      // Refresh courses to get updated data
      refreshCourses();
      
      // Close the dialog
      setShowTeeDialog(false);
    } catch (error) {
      console.error("Error adding tee:", error);
      toast({
        title: "Failed to add tee",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  // Start a new round - UPDATED to use the context
  const handleStartRound = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to track rounds",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedCourse) {
      toast({
        title: "Select a course",
        description: "Please select a course to continue",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTeeId) {
      toast({
        title: "Select a tee",
        description: "Please select a tee to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log(`Starting round with course: ${selectedCourse.name}, tee: ${selectedTeeId}, holes: ${selectedHoleCount}`);
      
      // Update context with selected values - using renamed context functions
      setContextSelectedCourse(selectedCourse);
      setContextSelectedTeeId(selectedTeeId);
      setContextHoleCount(selectedHoleCount);
      
      // Use context's createRound function
      const roundId = await createRound(selectedCourse.id, selectedTeeId);
      
      if (roundId) {
        console.log(`Round created with ID: ${roundId}, navigating to hole 1`);
        // Navigate to the first hole
        navigate(`/rounds/track/${roundId}/1`);
      } else {
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Failed to start round",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render course cards with expandable details
  const renderCourseCards = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (hasError) {
      return (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">
              Could not load courses. Please try again.
            </p>
            <Button variant="default" onClick={refreshCourses}>
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (filteredCourses.length === 0) {
      return (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No courses match your search" : "No courses available"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => (
          <Card 
            key={course.id} 
            className={`overflow-hidden transition-all duration-300 ${expandedCourseId === course.id ? 'ring-2 ring-primary' : ''}`}
          >
            <CardContent className="p-0">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => handleCourseClick(course.id, course)}
              >
                <div>
                  <h3 className="font-medium text-lg">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.city}, {course.state}
                  </p>
                </div>
                {expandedCourseId === course.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
              
              {/* Expanded section with tee selection and hole count */}
              {expandedCourseId === course.id && (
                <div className="p-6 pt-0 border-t">
                  {/* Use the TeeSelection component */}
                  {course.course_tees && course.course_tees.length > 0 ? (
                    <TeeSelection
                      selectedCourse={course}
                      selectedTeeId={selectedTeeId}
                      onTeeSelect={setSelectedTeeId}
                      onAddTee={() => handleAddTee(course)}
                    />
                  ) : (
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">No tee information available</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddTee(course)}
                          className="p-1 h-auto"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span className="text-xs">Add Tee</span>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Hole Count Selection - Added mt-6 for spacing */}
                  <div className="mt-6 mb-4">
                    <h4 className="text-sm font-medium mb-2">Holes to Play</h4>
                    <Tabs 
                      value={selectedHoleCount.toString()} 
                      onValueChange={(value) => setSelectedHoleCount(parseInt(value))}
                    >
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="9">9 Holes</TabsTrigger>
                        <TabsTrigger value="18">18 Holes</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleStartRound}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Creating Round...' : 'Start Round'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Selection</h1>
          <p className="text-muted-foreground">Select a course to track your round</p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses by name, city or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Course Cards */}
      {renderCourseCards()}
      
      {/* Add Tee Dialog */}
      <Dialog open={showTeeDialog} onOpenChange={setShowTeeDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Tee for {currentCourse?.name}</DialogTitle>
          </DialogHeader>
          <TeesForm onTeesSubmit={handleTeeSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseSelection;
