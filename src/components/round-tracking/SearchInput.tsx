
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SearchInputProps {
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export const SearchInput = ({ searchQuery, onChange, onClear }: SearchInputProps) => {
  return (
    <div className="relative flex items-center">
      <Input
        placeholder="Search for a golf course (name, city, or state)..."
        value={searchQuery}
        onChange={onChange}
        className="flex-1 pr-10"
      />
      {searchQuery && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={onClear}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
};
