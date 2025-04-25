import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";

interface DrillDetailsModalProps {
  drill: Drill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrillDetailsModal: React.FC<DrillDetailsModalProps> = ({ 
  drill, 
  isOpen, 
  onClose 
}) => {
  if (!drill) return null;

  const renderInstructions = () => {
    const instructions = [
      drill.instruction1,
      drill.instruction2,
      drill.instruction3,
      drill.instruction4,
      drill.instruction5,
    ].filter(Boolean);

    if (instructions.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Instructions</h3>
        <div className="space-y-6">
          {instructions.map((instruction, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {instruction}
            </p>
          ))}
        </div>
      </div>
    );
  };

  const renderCommonMistakes = () => {
    const mistakes = [
      drill.common_mistake1,
      drill.common_mistake2,
      drill.common_mistake3,
      drill.common_mistake4,
      drill.common_mistake5,
    ].filter(Boolean);

    if (mistakes.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Common Mistakes</h3>
        <div className="space-y-6">
          {mistakes.map((mistake, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {mistake}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <div className="flex items-center justify-between space-x-4">
            <DialogTitle className="text-xl font-bold flex-grow truncate">
              {drill.title}
            </DialogTitle>
            <Badge 
              className={
                drill.difficulty === 'Beginner' 
                  ? 'bg-emerald-500 text-white shrink-0' 
                  : drill.difficulty === 'Intermediate' 
                    ? 'bg-amber-500 text-white shrink-0' 
                    : 'bg-rose-500 text-white shrink-0'
              }
            >
              {drill.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{drill.duration}</p>
        </DialogHeader>
        
        <div className="mt-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-muted-foreground">{drill.overview}</p>
          </div>
          
          {renderInstructions()}
          {renderCommonMistakes()}
          
          {drill.pro_tip && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Pro Tip</h3>
              <p className="text-sm text-muted-foreground">{drill.pro_tip}</p>
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
