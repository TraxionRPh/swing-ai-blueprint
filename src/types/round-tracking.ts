
export interface CourseTee {
  id: string;
  name: string;
  color: string;
  course_rating: number;
  slope_rating: number;
}

export interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  course_tees: CourseTee[];
  // Adding the total_par property as optional since it's used but not in the original definition
  total_par?: number;
  is_verified?: boolean;
}

export interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  // Add a property to allow forms to prepare data for save
  prepareForSave?: () => void;
}

export interface RoundData {
  id: string;
  courseId: string;
  date: Date;
  totalScore?: number;
  holeCount: number;
  userId: string;
}
