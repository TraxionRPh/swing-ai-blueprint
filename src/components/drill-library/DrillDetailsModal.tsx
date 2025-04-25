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

  const formatInstructions = (text: string | undefined) => {
    if (!text) return '';
    
    // Split the text into sections based on headers
    const sections = text.split(/(?=How to perform:|Common Mistakes:|Pro tip:)/g);
    
    let formattedText = '';
    
    sections.forEach(section => {
      if (section.trim().startsWith('How to perform:')) {
        // Format numbered instructions
        const instructions = section.replace('How to perform:', '').trim()
          .split(/\d+\.|\n/).filter(Boolean)
          .map((instruction, index) => `${index + 1}. ${instruction.trim()}`)
          .join('\n');
        
        formattedText += `## How to perform:\n${instructions}\n\n`;
      }
      else if (section.trim().startsWith('Common Mistakes:')) {
        // Format mistakes and tips
        const mistakes = section.replace('Common Mistakes:', '').trim()
          .split('\n').filter(Boolean)
          .map(mistake => `- ${mistake.trim()}`)
          .join('\n');
        
        formattedText += `## Common Mistakes:\n${mistakes}\n\n`;
      }
      else if (section.trim().startsWith('Pro tip:')) {
        // Format pro tips
        formattedText += `## Pro tip:\n${section.replace('Pro tip:', '').trim()}\n\n`;
      }
    });
    
    return formattedText.trim();
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
                <ReactMarkdown className="text-sm text-muted-foreground">
                  {formatInstructions(drill.instructions)}
                </ReactMarkdown>
              </div>
            </div>
          )}

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
