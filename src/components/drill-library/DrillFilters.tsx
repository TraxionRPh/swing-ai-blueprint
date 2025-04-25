
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { DrillCard } from "./DrillCard";
import { DrillDetailsModal } from "./DrillDetailsModal";
import { useState } from "react";
import { Drill } from "@/types/drill";

interface DrillFiltersProps {
  drills: Drill[] | undefined;
  filterDrills: (drills: Drill[]) => Drill[];
}

export const DrillFilters = ({ drills, filterDrills }: DrillFiltersProps) => {
  const categories = ['driving', 'irons', 'chipping', 'putting'];
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

  const handleDrillDetails = (drill: Drill) => {
    setSelectedDrill(drill);
  };

  return (
    <>
      <Tabs defaultValue="driving" className="sticky top-0 z-10 bg-white">
        <TabsList className="grid grid-cols-4 mb-8 w-full">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterDrills(drills?.filter(drill => drill.category === category) || []).map(drill => (
                <div 
                  key={drill.id} 
                  onClick={() => handleDrillDetails(drill)}
                  className="cursor-pointer"
                >
                  <DrillCard drill={drill} />
                </div>
              ))}
              {filterDrills(drills?.filter(drill => drill.category === category) || []).length === 0 && (
                <div className="col-span-full text-center py-10">
                  <LucideGolf className="mx-auto h-12 w-12 text-muted-foreground/60" />
                  <h3 className="mt-4 text-lg font-medium">No drills found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <DrillDetailsModal 
        drill={selectedDrill} 
        isOpen={!!selectedDrill} 
        onClose={() => setSelectedDrill(null)} 
      />
    </>
  );
};
