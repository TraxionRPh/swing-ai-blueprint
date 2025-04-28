import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";
import { PracticeTracker } from "@/components/drill-library/PracticeTracker";

interface DrillDetailsDialogProps {
  drill: Drill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrillDetailsDialog = ({ drill, isOpen, onClose }: DrillDetailsDialogProps) => {
  if (!drill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative pt-8">
          <div className="flex flex-col items-center space-y-4">
            <DialogTitle className="text-xl font-bold text-center">
              {drill.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{drill.duration}</p>
            <Badge 
              className={
                drill.difficulty === 'Beginner' 
                  ? 'bg-emerald-500 text-white' 
                  : drill.difficulty === 'Intermediate' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-rose-500 text-white'
              }
            >
              {drill.difficulty}
            </Badge>
          </div>
        </DialogHeader>
        
        <PracticeTracker drill={drill} />
        
        <div className="mt-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-muted-foreground">{drill.overview}</p>
          </div>
          
          {[drill.instruction1, drill.instruction2, drill.instruction3]
            .filter(Boolean).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Instructions</h3>
              <div className="space-y-6">
                {[drill.instruction1, drill.instruction2, drill.instruction3]
                  .filter(Boolean)
                  .map((instruction, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm">{instruction}</p>
                    </div>
                ))}
              </div>
            </div>
          )}
          
          {drill.pro_tip && (
            <div className="mt-6 bg-[#FEF7CD] border border-yellow-300/50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Pro Tip</h3>
              <p className="text-sm text-gray-700">{drill.pro_tip}</p>
            </div>
          )}

          {drill.video_url && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Video Tutorial</h3>
              <iframe 
                src={drill.video_url} 
                title={`${drill.title} Tutorial`} 
                className="w-full aspect-video rounded-lg"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
