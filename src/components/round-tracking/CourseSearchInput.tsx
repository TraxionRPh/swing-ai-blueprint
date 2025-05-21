
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Course } from "@/types/round-tracking";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseSearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Course[];
  isSearching: boolean;
  recentCourses: Course[];
  showRecentCourses: boolean;
  onCourseSelect: (course: Course) => void;
  selectedCourseId?: string | null;
  hasSearchError?: boolean;
}

export const CourseSearchInput = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  recentCourses,
  showRecentCourses,
  onCourseSelect,
  selectedCourseId,
  hasSearchError = false
}: CourseSearchInputProps) => {
  
  const handleRetry = () => {
    if (searchQuery.trim()) {
      // Trigger a search by slightly modifying the query and then setting it back
      const currentQuery = searchQuery;
      setSearchQuery(currentQuery + " ");
      setTimeout(() => setSearchQuery(currentQuery), 10);
    }
  };
  
  return (
    <div className="relative w-full mb-6">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search for a course name, city, or state..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="h-11"
        />
        
        <CommandList className="max-h-[300px] overflow-y-auto">
          {isSearching && (
            <div className="py-6 text-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-2">Searching courses...</p>
            </div>
          )}
          
          {hasSearchError && (
            <div className="py-6 text-center">
              <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive font-medium mb-2">Error searching courses</p>
              <p className="text-sm text-muted-foreground mb-3">Check your connection and try again</p>
              <Button size="sm" variant="outline" onClick={handleRetry}>
                Retry Search
              </Button>
            </div>
          )}
          
          {!isSearching && !hasSearchError && searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => onCourseSelect(course)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-md mb-2 hover:bg-secondary/20",
                    selectedCourseId === course.id 
                      ? "bg-secondary border-l-4 border-primary" 
                      : "bg-card"
                  )}
                  value={`${course.name} ${course.city} ${course.state}`}
                  data-selected={selectedCourseId === course.id ? "true" : undefined}
                >
                  <div className="font-medium text-foreground">
                    {course.name}
                  </div>
                  <div className="text-sm text-foreground/80">
                    {course.city}, {course.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {!isSearching && !hasSearchError && searchQuery === "" && showRecentCourses && recentCourses.length > 0 && (
            <CommandGroup heading="Recently Played">
              {recentCourses.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => onCourseSelect(course)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-md mb-2 hover:bg-secondary/20",
                    selectedCourseId === course.id 
                      ? "bg-secondary border-l-4 border-primary" 
                      : "bg-card"
                  )}
                  value={`${course.name} ${course.city} ${course.state}`}
                  data-selected={selectedCourseId === course.id ? "true" : undefined}
                >
                  <div className="font-medium text-foreground">
                    {course.name}
                  </div>
                  <div className="text-sm text-foreground/80">
                    {course.city}, {course.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {!isSearching && !hasSearchError && searchQuery !== "" && searchResults.length === 0 && (
            <CommandEmpty>No courses found. Try a different search.</CommandEmpty>
          )}
        </CommandList>
      </Command>
    </div>
  );
};
