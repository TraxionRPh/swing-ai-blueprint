
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
