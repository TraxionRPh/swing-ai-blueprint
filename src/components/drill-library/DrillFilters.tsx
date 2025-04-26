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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
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
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full grid grid-cols-6 p-0 h-12">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={selectedDifficulty === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedDifficulty(null)}
        >
          All Difficulties
        </Badge>
        {difficulties.map(difficulty => (
          <Badge 
            key={difficulty} 
            variant={selectedDifficulty === difficulty ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedDifficulty(difficulty)}
          >
            {difficulty}
          </Badge>
        ))}
      </div>
    </div>
  );
};
