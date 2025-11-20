export type NormalizedIngredient = {
  name: string;      
  amount: number | null;
  unit: string | null; 
};

export type NormalizedRecipe = {
  title: string;
  description?: string;
  timeMinutes?: number;
  difficulty?: "easy" | "medium" | "hard" | "unknown";
  ingredients: NormalizedIngredient[];
  steps: string[];
};
