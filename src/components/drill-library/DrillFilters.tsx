
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { DrillCard } from "./DrillCard";

type Drill = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  focus: string[];
  video_url: string | null;
  category: string;
};

interface DrillFiltersProps {
  drills: Drill[] | undefined;
  filterDrills: (drills: Drill[]) => Drill[];
}

export const DrillFilters = ({ drills, filterDrills }: DrillFiltersProps) => {
  const categories = ['driving', 'irons', 'chipping', 'putting'];

  return (
    <Tabs defaultValue="driving">
      <TabsList className="grid grid-cols-4 mb-8">
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
              <DrillCard key={drill.id} drill={drill} />
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
  );
};
