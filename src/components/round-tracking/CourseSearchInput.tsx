
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Course } from "@/types/round-tracking";
import { cn } from "@/lib/utils";

interface CourseSearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Course[];
  isSearching: boolean;
  recentCourses: Course[];
  showRecentCourses: boolean;
  onCourseSelect: (course: Course) => void;
  selectedCourseId?: string | null;
}

export const CourseSearchInput = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  recentCourses,
  showRecentCourses,
  onCourseSelect,
  selectedCourseId
}: CourseSearchInputProps) => {
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
          
          {!isSearching && searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => onCourseSelect(course)}
                  className={cn(
                    "flex flex-col items-start p-3 transition-colors cursor-pointer rounded-md mb-2 touch-course-item",
                    selectedCourseId === course.id 
                      ? "bg-secondary/10 border border-primary shadow-sm" 
                      : "hover:bg-secondary/20 active:bg-secondary/30"
                  )}
                  value={`${course.name} ${course.city} ${course.state}`}
                  data-selected={selectedCourseId === course.id ? "true" : undefined}
                >
                  <div className="font-medium text-foreground flex w-full justify-between items-center">
                    {course.name}
                    <span className="text-primary text-xs font-bold">TAP TO SELECT</span>
                  </div>
                  <div className="text-sm text-foreground/80">
                    {course.city}, {course.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {!isSearching && searchQuery === "" && showRecentCourses && recentCourses.length > 0 && (
            <CommandGroup heading="Recently Played">
              {recentCourses.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => onCourseSelect(course)}
                  className={cn(
                    "flex flex-col items-start p-3 transition-colors cursor-pointer rounded-md mb-2 touch-course-item",
                    selectedCourseId === course.id 
                      ? "bg-secondary/10 border border-primary shadow-sm" 
                      : "hover:bg-secondary/20 active:bg-secondary/30"
                  )}
                  value={`${course.name} ${course.city} ${course.state}`}
                  data-selected={selectedCourseId === course.id ? "true" : undefined}
                >
                  <div className="font-medium text-foreground flex w-full justify-between items-center">
                    {course.name}
                    <span className="text-primary text-xs font-bold">TAP TO SELECT</span>
                  </div>
                  <div className="text-sm text-foreground/80">
                    {course.city}, {course.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {!isSearching && searchQuery !== "" && searchResults.length === 0 && (
            <CommandEmpty>No courses found. Try a different search.</CommandEmpty>
          )}
        </CommandList>
      </Command>
    </div>
  );
};
