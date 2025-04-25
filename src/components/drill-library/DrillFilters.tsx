
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface DrillFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  focusAreas: string[];
  selectedFocus: string | null;
  onFocusChange: (focus: string | null) => void;
  difficulties: string[];
  selectedDifficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
}

export const DrillFilters: React.FC<DrillFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  focusAreas,
  selectedFocus,
  onFocusChange,
  difficulties,
  selectedDifficulty,
  onDifficultyChange
}) => {
  return (
    <>
      <div className="sticky top-0 z-10 bg-background shadow-sm pb-4">
        <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
          <TabsList className="grid grid-cols-4 w-full">
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge 
          variant={selectedFocus === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onFocusChange(null)}
        >
          All Focus Areas
        </Badge>
        {focusAreas.map(focus => (
          <Badge 
            key={focus} 
            variant={selectedFocus === focus ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onFocusChange(focus)}
          >
            {focus}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge 
          variant={selectedDifficulty === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onDifficultyChange(null)}
        >
          All Difficulties
        </Badge>
        {difficulties.map(difficulty => (
          <Badge 
            key={difficulty} 
            variant={selectedDifficulty === difficulty ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onDifficultyChange(difficulty)}
          >
            {difficulty}
          </Badge>
        ))}
      </div>
    </>
  );
};
