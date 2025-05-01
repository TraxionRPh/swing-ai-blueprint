
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  min?: number;
  max?: number;
}

export const ScoreInput = ({
  label,
  value,
  onChange,
  icon,
  min = 0,
  max = 99
}: ScoreInputProps) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-2">
        {icon && <div>{icon}</div>}
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div className="flex items-center border rounded-md">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          className="rounded-r-none h-12"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-center text-2xl font-semibold">
          {value}
        </div>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          className="rounded-l-none h-12"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
