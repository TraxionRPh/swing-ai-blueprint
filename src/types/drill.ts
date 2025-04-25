
export interface Drill {
  id: string;  
  title: string;
  description?: string;  // Make this optional
  overview: string;  // Add this field
  category: string;
  focus: string[];
  difficulty: string;
  duration: string;
  video_url: string | null;
  instructions?: string;  // Make this optional
  created_at?: string;
  updated_at?: string;
}
