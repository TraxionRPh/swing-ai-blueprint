
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";

interface DrillFiltersProps {
  drills: Drill[];
  filterDrills: (drills?: Drill[]) => Drill[];
}

export const DrillFilters: React.FC<DrillFiltersProps> = ({
  drills,
  filterDrills
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  // Extract unique categories, focus areas, and difficulties from the drills
  useEffect(() => {
    if (!drills || drills.length === 0) return;
    
    // Extract categories
    const uniqueCategories = ['all', ...new Set(drills.map(drill => drill.category))];
    setCategories(uniqueCategories);
    
    // Extract focus areas (flattening nested arrays)
    const allFocusAreas = drills.reduce((areas: string[], drill) => {
      return [...areas, ...drill.focus];
    }, []);
    const uniqueFocusAreas = [...new Set(allFocusAreas)];
    setFocusAreas(uniqueFocusAreas);
    
    // Extract difficulties
    const uniqueDifficulties = [...new Set(drills.map(drill => drill.difficulty))];
    setDifficulties(uniqueDifficulties);
  }, [drills]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleFocusChange = (focus: string | null) => {
    setSelectedFocus(focus);
  };

  const handleDifficultyChange = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-background shadow-sm pb-4">
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
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
          onClick={() => handleFocusChange(null)}
        >
          All Focus Areas
        </Badge>
        {focusAreas.map(focus => (
          <Badge 
            key={focus} 
            variant={selectedFocus === focus ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFocusChange(focus)}
          >
            {focus}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge 
          variant={selectedDifficulty === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleDifficultyChange(null)}
        >
          All Difficulties
        </Badge>
        {difficulties.map(difficulty => (
          <Badge 
            key={difficulty} 
            variant={selectedDifficulty === difficulty ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleDifficultyChange(difficulty)}
          >
            {difficulty}
          </Badge>
        ))}
      </div>
    </>
  );
};
