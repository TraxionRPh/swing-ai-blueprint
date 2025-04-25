
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";
import ReactMarkdown from 'react-markdown';

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

  // Format instructions by replacing n/n1 with line breaks
  const formatInstructions = (text: string | undefined) => {
    if (!text) return '';
    // Replace n/n1 with proper markdown line breaks
    return text.replace(/n\/n1/g, '\n\n');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{drill.title}</DialogTitle>
          <div className="flex items-center justify-between mt-2">
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
            <span className="text-sm text-muted-foreground">{drill.duration}</span>
          </div>
          <DialogDescription className="mt-4">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{drill.description}</ReactMarkdown>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-6">
          {drill.overview && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-sm text-muted-foreground">{drill.overview}</p>
            </div>
          )}

          {drill.instructions && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-sm text-muted-foreground">
                  <ReactMarkdown>
                    {formatInstructions(drill.instructions)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Add null check for focus */}
          {drill.focus && Array.isArray(drill.focus) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {drill.focus.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {drill.video_url && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Video Tutorial</h3>
              <iframe 
                src={drill.video_url} 
                title={`${drill.title} Tutorial`} 
                className="w-full aspect-video"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
