
export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
  metric: string;
  instruction1?: string;
  instruction2?: string;
  instruction3?: string;
};
