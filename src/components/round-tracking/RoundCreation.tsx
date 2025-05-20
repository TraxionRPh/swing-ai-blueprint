
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRound } from "@/context/RoundContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { Course, CourseTee } from "@/types/round-tracking";
import { Search } from "lucide-react";

interface CourseCreationProps {
  onBack: () => void;
  holeCount?: number;
}

export const RoundCreation = ({ onBack, holeCount = 18 }: CourseCreationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    setHoleCount, 
    selectedCourse, 
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    createRound
  } = useRound();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [showRecentCourses, setShowRecentCourses] = useState(true);
  
  // Set the hole count from props
  useEffect(() => {
    setHoleCount(holeCount);
  }, [holeCount, setHoleCount]);

  // Fetch recent courses on component mount
  useEffect(() => {
    if (user) {
      fetchRecentCourses();
    }
  }, [user]);

  const fetchRecentCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          course_id,
          golf_courses:course_id (
            id,
            name,
            city,
            state,
            course_tees (*)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Filter out duplicates and nulls
      const uniqueCourses = data?.map(item => item.golf_courses)
        .filter((course, index, self) => 
          course && self.findIndex(c => c?.id === course.id) === index
        );
        
      setRecentCourses(uniqueCourses || []);
    } catch (error) {
      console.error("Error fetching recent courses:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowRecentCourses(false);
    
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*, course_tees (*)')
        .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`)
        .order('name')
        .limit(10);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching courses:", error);
      toast({
        title: "Error searching courses",
        description: "Could not complete the search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    
    // Set the first tee as default if available
    if (course.course_tees?.length > 0) {
      setSelectedTeeId(course.course_tees[0].id);
    }
  };

  const handleTeeSelect = (teeId: string) => {
    setSelectedTeeId(teeId);
  };

  const handleStartRound = async () => {
    if (!selectedCourse) {
      toast({
        title: "Course Required",
        description: "Please select a course before starting your round",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new round
    const roundId = await createRound(selectedCourse.id, selectedTeeId);
    
    if (roundId) {
      // Navigate to first hole
      navigate(`/rounds/${roundId}/1`);
    }
  };

  // Render tee selection
  const renderTeeSelection = () => {
    if (!selectedCourse || !selectedCourse.course_tees?.length) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Select Tee</h3>
        <div className="flex flex-wrap gap-2">
          {selectedCourse.course_tees.map((tee) => {
            const isLightColor = ['white', 'yellow', 'gold', 'beige'].includes(tee.color?.toLowerCase() || '');
            
            return (
              <Button
                key={tee.id}
                size="sm"
                variant={selectedTeeId === tee.id ? "default" : "outline"}
                onClick={() => handleTeeSelect(tee.id)}
                style={{
                  backgroundColor: selectedTeeId === tee.id ? undefined : tee.color || undefined,
                  color: selectedTeeId === tee.id ? undefined : 
                         (tee.color ? (isLightColor ? 'black' : 'white') : undefined)
                }}
              >
                {tee.color || tee.name}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render hole count selection
  const renderHoleCountSelection = () => {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Round Type</h3>
        <RadioGroup 
          defaultValue={holeCount.toString()} 
          className="grid grid-cols-2 gap-4"
          onValueChange={(value) => {
            setHoleCount(parseInt(value));
            
            // Update URL to reflect hole count
            const baseUrl = "/rounds/new";
            if (value === "9") {
              navigate(`${baseUrl}/9`, { replace: true });
            } else if (value === "18") {
              navigate(`${baseUrl}/18`, { replace: true });
            } else {
              navigate(baseUrl, { replace: true });
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="9" id="nine" />
            <Label htmlFor="nine">9 Holes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="18" id="eighteen" />
            <Label htmlFor="eighteen">18 Holes</Label>
          </div>
        </RadioGroup>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <RoundHeader
        title="New Round"
        subtitle="Select a course and start tracking your round"
        onBack={onBack}
      />
      
      {/* Course Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Search for a course name, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium">Search Results</h3>
              {searchResults.map((course) => (
                <Card 
                  key={course.id} 
                  className={`cursor-pointer hover:bg-accent ${selectedCourse?.id === course.id ? 'border-primary' : ''}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <CardContent className="p-3">
                    <div>
                      <h4 className="font-medium">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.city}, {course.state}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Recent Courses */}
          {showRecentCourses && recentCourses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recently Played</h3>
              {recentCourses.map((course) => (
                <Card 
                  key={course.id} 
                  className={`cursor-pointer hover:bg-accent ${selectedCourse?.id === course.id ? 'border-primary' : ''}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <CardContent className="p-3">
                    <div>
                      <h4 className="font-medium">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.city}, {course.state}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Selected Course */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{selectedCourse.name}</h3>
              <p className="text-muted-foreground">
                {selectedCourse.city}, {selectedCourse.state}
              </p>
            </div>
            
            {renderTeeSelection()}
            {renderHoleCountSelection()}
            
            <Button 
              className="w-full mt-6" 
              size="lg" 
              onClick={handleStartRound}
              disabled={!selectedCourse || !selectedTeeId}
            >
              Start Round
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
