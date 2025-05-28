export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category?: string;
  metrics?: string[];
  totalAttempts?: number;
  instructions?: string[];
}