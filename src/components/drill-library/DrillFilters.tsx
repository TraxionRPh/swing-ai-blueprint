
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";

interface DrillFiltersProps {
  drills: Drill[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (difficulty: string | null) => void;
}

export const DrillFilters: React.FC<DrillFiltersProps> = ({
  drills,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty
}) => {
  const [categories, setCategories] = useState<string[]>(['all']);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  useEffect(() => {
    if (!drills || drills.length === 0) return;
    
    const uniqueCategories = ['all', ...new Set(drills.map(drill => drill.category))];
    setCategories(uniqueCategories);
    
    // Predefined order for difficulties
    const difficultyOrder = ['Beginner', 'Intermediate', 'Advanced'];
    const uniqueDifficulties = [...new Set(drills.map(drill => drill.difficulty))]
      .sort((a, b) => {
        const indexA = difficultyOrder.indexOf(a);
        const indexB = difficultyOrder.indexOf(b);
        
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        return a.localeCompare(b);
      });
    
    setDifficulties(uniqueDifficulties);
  }, [drills]);

  return (
    <div className="space-y-4">
      <Tabs 
        value={selectedCategory} 
        onValueChange={setSelectedCategory} 
        className="w-full"
      >
        <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-background p-1">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="flex-none px-4 py-2 text-sm rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors border border-transparent data-[state=active]:border-primary/50"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={selectedDifficulty === null ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => setSelectedDifficulty(null)}
        >
          All Difficulties
        </Badge>
        {difficulties.map(difficulty => (
          <Badge 
            key={difficulty} 
            variant={selectedDifficulty === difficulty ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={() => setSelectedDifficulty(difficulty)}
          >
            {difficulty}
          </Badge>
        ))}
      </div>
    </div>
  );
};
