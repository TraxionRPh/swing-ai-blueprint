
import { LucideProps } from "lucide-react";
import { forwardRef } from "react";

export const LucideGolf = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 18v-6" />
    <path d="M8 18v-1" />
    <path d="M16 18v-1" />
    <path d="M12 12c-3 0-4.5-1.5-4.5-1.5L12 2l4.5 8.5c0 0-1.5 1.5-4.5 1.5z" />
    <path d="M20 18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
  </svg>
));

LucideGolf.displayName = "LucideGolf";

// Re-export needed Lucide icons
export { Home, Award, Calendar, Clock, Brain, List, User } from "lucide-react";

// Custom Dumbbell icon for workouts/training
export const Dumbbell = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6.5 6.5 17.5 17.5"></path>
    <path d="M4 10h16"></path>
    <path d="M10 4v16"></path>
  </svg>
));

Dumbbell.displayName = "Dumbbell";
