export type Unit = 'pcs' | 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup';

export type PantryItemInput = {
  name: string;
  qty?: number;
  unit?: Unit | string;
};

export type Ingredient = {
  id: string;              
  canonicalName: string;    
  aliases: string[];         
};

export type RecipeIngredient = {
  ingredientId: string;      
  amount?: number | null;
  unit?: string | null;
  optional?: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags?: string[];
  timeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type SuggestedRecipe = {
  id: string;
  title: string;
  score: number;
  missingIngredients: { name: string; optional: boolean }[];
  usedIngredients: { name: string }[];
  timeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  steps: string[];
  description?: string;
};

export type SuggestRecipesOptions = {
  maxResults?: number;
};
