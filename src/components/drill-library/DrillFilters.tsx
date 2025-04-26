import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CarFront, Iron, ChipIcon, Flag, Book } from "lucide-react";
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

  const categoryIcons = {
    'driving': CarFront,
    'irons': Iron,
    'chipping': ChipIcon,
    'putting': Flag,
    'fundamentals': Book
  };

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

      <ToggleGroup
        type="single"
        value={selectedDifficulty || "all"}
        onValueChange={(value) => setSelectedDifficulty(value === "all" ? null : value)}
        className="flex flex-wrap justify-start gap-2"
      >
        <ToggleGroupItem 
          value="all"
          variant="outline" 
          size="sm"
          className={`flex items-center gap-2 px-4 py-2 ${!selectedDifficulty ? 'bg-primary text-primary-foreground' : ''}`}
        >
          All Levels
        </ToggleGroupItem>
        {difficulties.map(difficulty => {
          const Icon = categoryIcons[difficulty.toLowerCase() as keyof typeof categoryIcons];
          return (
            <ToggleGroupItem
              key={difficulty}
              value={difficulty}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 px-4 py-2 ${selectedDifficulty === difficulty ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {difficulty}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
};
