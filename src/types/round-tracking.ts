
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
}

export interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

export interface RoundData {
  id: string;
  courseId: string;
  date: Date;
  totalScore?: number;
  holeCount: number;
  userId: string;
}
