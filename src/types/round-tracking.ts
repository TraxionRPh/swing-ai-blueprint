
export interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  total_par?: number;
  is_verified?: boolean;
  course_tees: CourseTee[];
  course_holes?: CourseHole[];
}

export interface CourseTee {
  id: string;
  name: string;
  color?: string;
  course_rating?: number;
  slope_rating?: number;
  total_yards?: number;
}

export interface CourseHole {
  id: string;
  hole_number: number;
  par: number;
  distance_yards?: number;
}

export interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit: boolean;
  greenInRegulation: boolean;
}

export interface Round {
  id: string;
  user_id: string;
  course_id: string;
  tee_id?: string;
  date: string;
  hole_count: number;
  total_score?: number;
  total_putts?: number;
  fairways_hit?: number;
  greens_in_regulation?: number;
  created_at?: string;
  updated_at?: string;
  course?: Course;
}

export type RoundStatus = 'idle' | 'loading' | 'saving' | 'error' | 'success';
