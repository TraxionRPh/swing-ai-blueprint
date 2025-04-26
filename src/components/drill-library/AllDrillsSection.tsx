
import { Drill } from "@/types/drill";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DrillFilters } from "./DrillFilters";
import { DrillCard } from "./DrillCard";

interface AllDrillsSectionProps {
  drills: Drill[] | null;
  filteredDrills: Drill[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (difficulty: string | null) => void;
}

export const AllDrillsSection = ({
  drills,
  filteredDrills,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty
}: AllDrillsSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Drills</h2>
      <ScrollArea className="h-[600px]">
        {drills && (
          <DrillFilters 
            drills={drills}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredDrills.map((drill) => (
            <DrillCard key={drill.id} drill={drill} />
          ))}
        </div>
        
        {filteredDrills.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No drills match your filters.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
