
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CourseSearch } from "../CourseSearch";
import { RoundsDisplay } from "../RoundsDisplay";
import type { Course } from "@/types/round-tracking";

interface CourseSelectionCardProps {
  onCourseSelect: (course: Course, holeCount?: number) => void;
}

export const CourseSelectionCard = ({ onCourseSelect }: CourseSelectionCardProps) => {
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Course</CardTitle>
        <div className="flex space-x-2 mt-2">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'search' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'history' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'search' ? (
          <CourseSearch onCourseSelect={onCourseSelect} />
        ) : (
          <RoundsDisplay onCourseSelect={onCourseSelect} />
        )}
      </CardContent>
    </Card>
  );
}
