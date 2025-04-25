
export interface Drill {
  id: string;  // Changed from number to string to match UUID
  title: string;
  description: string;
  category: string;
  focus: string[];
  difficulty: string;
  duration: string;
  video_url: string | null;
  created_at?: string;
  updated_at?: string;
}
