
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/round-tracking";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { TeeSelection } from "./TeeSelection";
import { HoleCountSelection } from "./HoleCountSelection";

interface CourseCardProps {
  course: Course;
  isExpanded: boolean;
  selectedTeeId: string | null;
  selectedHoleCount: number;
  isProcessing: boolean;
  processingError: string | null;
  onCourseClick: (courseId: string, course: Course) => void;
  onTeeSelect: (teeId: string) => void;
  onAddTee: (course: Course) => void;
  onHoleCountChange: (count: number) => void;
  onStartRound: () => void;
}

export const CourseCard = ({
  course,
  isExpanded,
  selectedTeeId,
  selectedHoleCount,
  isProcessing,
  processingError,
  onCourseClick,
  onTeeSelect,
  onAddTee,
  onHoleCountChange,
  onStartRound
}: CourseCardProps) => {
  return (
    <Card 
      key={course.id} 
      className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-0">
        <div 
          className="p-6 cursor-pointer flex justify-between items-center"
          onClick={() => onCourseClick(course.id, course)}
        >
          <div>
            <h3 className="font-medium text-lg">{course.name}</h3>
            <p className="text-sm text-muted-foreground">
              {course.city}, {course.state}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
        
        {/* Expanded section with tee selection and hole count */}
        {isExpanded && (
          <div className="p-6 pt-0 border-t">
            {/* Use the TeeSelection component */}
            {course.course_tees && course.course_tees.length > 0 ? (
              <TeeSelection
                selectedCourse={course}
                selectedTeeId={selectedTeeId}
                onTeeSelect={onTeeSelect}
                onAddTee={() => onAddTee(course)}
              />
            ) : (
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">No tee information available</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onAddTee(course)}
                    className="p-1 h-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="text-xs">Add Tee</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* Hole Count Selection */}
            <div className="mt-6 mb-4">
              <HoleCountSelection
                holeCount={selectedHoleCount}
                setHoleCount={onHoleCountChange}
              />
            </div>
            
            <Button 
              className="w-full mt-2" 
              onClick={onStartRound}
              disabled={isProcessing || !selectedTeeId}
            >
              {isProcessing ? 'Creating Round...' : 'Start Round'}
            </Button>
            
            {processingError && (
              <p className="text-sm text-destructive mt-2">
                {processingError}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
