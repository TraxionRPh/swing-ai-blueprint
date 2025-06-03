
import { Course } from "@/types/round-tracking";
import { TeesForm } from "./TeesForm";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/Dialog";

interface TeeDialogProps {
  currentCourse: Course | null;
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  onTeeSubmit: (teeData: any) => Promise<any>; // Updated to expect a return value
}

export const TeeDialog = ({ 
  currentCourse, 
  showDialog, 
  onOpenChange,
  onTeeSubmit 
}: TeeDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Tee for {currentCourse?.name}</DialogTitle>
        </DialogHeader>
        <TeesForm onTeesSubmit={onTeeSubmit} />
      </DialogContent>
    </Dialog>
  );
};
