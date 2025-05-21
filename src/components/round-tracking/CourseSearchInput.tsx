
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Course } from "@/types/round-tracking";

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
                  className={`flex flex-col items-start p-2 ${selectedCourseId === course.id ? 'bg-accent' : ''}`}
                >
                  <div className="font-medium">{course.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.city}, {course.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {searchQuery.trim() === "" && showRecentCourses && recentCourses.length > 0 && (
            <CommandGroup heading="Recently Played">
              {recentCourses.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => onCourseSelect(course)}
                  className={`flex flex-col items-start p-2 ${selectedCourseId === course.id ? 'bg-accent' : ''}`}
                >
                  <div className="font-medium">{course.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.city}, {course.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {searchQuery.trim() !== "" && searchResults.length === 0 && !isSearching && (
            <CommandEmpty>No courses found. Try a different search.</CommandEmpty>
          )}
        </CommandList>
      </Command>
    </div>
  );
};
