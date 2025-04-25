
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export interface CourseBasicInfo {
  name: string;
  city: string;
  state: string;
  totalPar: string;
}

interface BasicInfoFormProps {
  onSubmit: (data: CourseBasicInfo) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const BasicInfoForm = ({ onSubmit, onCancel, isSubmitting }: BasicInfoFormProps) => {
  const form = useForm<CourseBasicInfo>({
    defaultValues: {
      name: "",
      city: "",
      state: "",
      totalPar: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Course name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter course name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          rules={{ required: "City is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter city" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          rules={{ required: "State is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalPar"
          rules={{ 
            required: "Total par is required",
            validate: (value) => {
              const numValue = parseInt(value);
              return (numValue > 0 && numValue < 100) || "Invalid par value";
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Par</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="Enter total par (e.g., 72)" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Next: Add Tees"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
