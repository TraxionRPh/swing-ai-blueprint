import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { TeeSelection } from "./TeeSelection";
import { HoleCountSelection } from "./HoleCountSelection";

const CourseSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [selectedHoleCount, setSelectedHoleCount] = useState<number>(18);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);
  
  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(course => 
      course.name.toLowerCase().includes(query) || 
      course.city.toLowerCase().includes(query) || 
      course.state.toLowerCase().includes(query)
    );
    
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);
  
  // Fetch courses from Supabase
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      
      // First get all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("golf_courses")
        .select("*")
        .order("name");
      
      if (coursesError) throw coursesError;
      
      // Then get all tees for these courses
      const { data: teesData, error: teesError } = await supabase
        .from("course_tees")
        .select("*");
      
      if (teesError) throw teesError;
      
      // Combine the data
      const coursesWithTees = coursesData.map(course => ({
        ...course,
        course_tees: teesData.filter(tee => tee.course_id === course.id) || []
      }));
      
      setCourses(coursesWithTees);
      setFilteredCourses(coursesWithTees);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Failed to load courses",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  // Start a new round
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
    
    try {
      // Create new round in the database
      const { data, error } = await supabase
        .from("rounds")
        .insert({
          user_id: user.id,
          course_id: selectedCourse.id,
          tee_id: selectedTeeId,
          hole_count: selectedHoleCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select("id")
        .single();
      
      if (error) throw error;
      
      if (data && data.id) {
        // Save info to session storage for persistence
        try {
          sessionStorage.setItem('current-round-id', data.id);
          sessionStorage.setItem('selected-hole-count', selectedHoleCount.toString());
        } catch (storageError) {
          console.error('Failed to save to storage:', storageError);
        }
        
        // Navigate to the first hole
        navigate(`/rounds/track/${data.id}/1`);
      }
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Failed to start round",
        description: "Please try again",
        variant: "destructive"
      });
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
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">No tee information available</p>
                  )}
                  
                  {/* Hole Count Selection */}
                  <div className="mb-4">
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
                  >
                    Start Round
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
    </div>
  );
};

export default CourseSelection;
