
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoundTracking } from '@/hooks/useRoundTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, X } from 'lucide-react';
import type { Course } from '@/types/round-tracking';
import { CourseCard } from './CourseCard';

interface CourseSelectorProps {
  selectedCourse?: Course | null;
  selectedTee?: string | null;
  onCourseSelect?: (course: Course) => void;
  onTeeSelect?: (teeId: string | null) => void;
}

export const CourseSelector = ({ selectedCourse: propSelectedCourse, selectedTee: propSelectedTee, onCourseSelect, onTeeSelect }: CourseSelectorProps = {}) => {
  const navigate = useNavigate();
  const { fetchRecentCourses, searchCourses, selectCourseAndTee } = useRoundTracking();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(propSelectedCourse || null);
  const [selectedTee, setSelectedTee] = useState<string | null>(propSelectedTee || null);
  const [holeCount, setHoleCount] = useState<number>(18);
  
  // Update local state when props change
  useEffect(() => {
    if (propSelectedCourse) {
      setSelectedCourse(propSelectedCourse);
    }
    if (propSelectedTee !== undefined) {
      setSelectedTee(propSelectedTee);
    }
  }, [propSelectedCourse, propSelectedTee]);
  
  // Fetch recent courses on initial load
  useEffect(() => {
    const loadRecentCourses = async () => {
      const courses = await fetchRecentCourses();
      setRecentCourses(courses || []);
    };
    
    loadRecentCourses();
  }, [fetchRecentCourses]);
  
  // Handle search query changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchCourses(searchQuery);
        setSearchResults(results || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, searchCourses]);
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    
    // Call parent handler if provided
    if (onCourseSelect) {
      onCourseSelect(course);
    }
    
    // Set default tee if available
    if (course.course_tees && course.course_tees.length > 0) {
      const defaultTee = course.course_tees[0].id;
      setSelectedTee(defaultTee);
      
      // Call parent handler if provided
      if (onTeeSelect) {
        onTeeSelect(defaultTee);
      }
    } else {
      setSelectedTee(null);
      if (onTeeSelect) {
        onTeeSelect(null);
      }
    }
  };

  const handleTeeSelect = (teeId: string | null) => {
    setSelectedTee(teeId);
    if (onTeeSelect) {
      onTeeSelect(teeId);
    }
  };
  
  const handleStartRound = async () => {
    if (!selectedCourse) return;
    
    // Create the round
    try {
      const roundId = await selectCourseAndTee(selectedCourse.id, selectedTee, holeCount);
      if (roundId) {
        navigate(`/rounds/${roundId}/1`);
      }
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Start New Round</h2>
      
      {!selectedCourse ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select a Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a course..."
                    className="pl-9 pr-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <X
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                      onClick={handleClearSearch}
                    />
                  )}
                </div>
                
                {isSearching && (
                  <div className="text-center py-4 text-sm text-muted-foreground animate-pulse">
                    Searching...
                  </div>
                )}
                
                {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">No courses found</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Course
                    </Button>
                  </div>
                )}
                
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map((course) => (
                        <CourseCard 
                          key={course.id}
                          course={course}
                          onSelect={handleCourseSelect}
                        />
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim().length === 0 && recentCourses.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Recently Played</h3>
                    <div className="space-y-2">
                      {recentCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onSelect={handleCourseSelect}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCourse.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedCourse.city}, {selectedCourse.state}
                </p>
              </div>
              
              {selectedCourse.course_tees && selectedCourse.course_tees.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select Tee:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.course_tees.map((tee) => {
                      const isLightColor = ['white', 'yellow', 'gold'].includes(tee.color?.toLowerCase() || '');
                      return (
                        <Button 
                          key={tee.id} 
                          variant={selectedTee === tee.id ? "default" : "outline"} 
                          onClick={() => handleTeeSelect(tee.id)}
                          style={{
                            backgroundColor: selectedTee === tee.id ? undefined : tee.color || undefined,
                            color: selectedTee === tee.id ? undefined : 
                                  (tee.color ? (isLightColor ? 'black' : 'white') : undefined)
                          }}
                        >
                          {tee.color || tee.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Number of Holes:</p>
                <div className="flex gap-2">
                  <Button 
                    variant={holeCount === 9 ? "default" : "outline"}
                    onClick={() => setHoleCount(9)}
                  >
                    9 Holes
                  </Button>
                  <Button 
                    variant={holeCount === 18 ? "default" : "outline"}
                    onClick={() => setHoleCount(18)}
                  >
                    18 Holes
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  Back
                </Button>
                <Button onClick={handleStartRound}>
                  Start Round
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
