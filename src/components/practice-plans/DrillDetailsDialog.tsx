
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";

interface DrillDetailsDialogProps {
  drill: Drill;
  isOpen: boolean;
  onClose: () => void;
}

export const DrillDetailsDialog = ({ drill, isOpen, onClose }: DrillDetailsDialogProps) => {
  if (!drill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{drill.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{drill.difficulty}</Badge>
            <span className="text-sm text-muted-foreground">{drill.duration}</span>
          </div>
          
          <p className="text-sm text-muted-foreground">{drill.overview}</p>
          
          {[drill.instruction1, drill.instruction2, drill.instruction3]
            .filter(Boolean)
            .map((instruction, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm">{instruction}</p>
              </div>
          ))}
          
          {drill.pro_tip && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Pro Tip</h4>
              <p className="text-sm">{drill.pro_tip}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
