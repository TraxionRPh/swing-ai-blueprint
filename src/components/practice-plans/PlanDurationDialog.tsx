
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PlanDurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planDuration: string;
  onPlanDurationChange: (duration: string) => void;
  onConfirm: () => void;
}

export const PlanDurationDialog = ({
  isOpen,
  onClose,
  planDuration,
  onPlanDurationChange,
  onConfirm,
}: PlanDurationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Practice Duration</DialogTitle>
          <DialogDescription>
            Select how many days you'd like your practice plan to cover
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={planDuration} onValueChange={onPlanDurationChange} className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="duration-1" />
              <Label htmlFor="duration-1">1 Day Practice Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="duration-3" />
              <Label htmlFor="duration-3">3 Day Practice Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="duration-5" />
              <Label htmlFor="duration-5">5 Day Practice Plan</Label>
            </div>
          </RadioGroup>
          <Button onClick={onConfirm} className="w-full mt-4">
            Create Practice Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);

