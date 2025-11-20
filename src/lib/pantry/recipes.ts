import { Ingredient, Recipe } from '@/lib/pantry/types';

export const INGREDIENTS: Ingredient[] = [
  { id: 'tomato', canonicalName: 'tomato', aliases: ['tomatoes', 'roma tomato', 'roma tomatoes'] },
  { id: 'pasta', canonicalName: 'pasta', aliases: ['spaghetti', 'penne', 'macaroni'] },
  { id: 'olive_oil', canonicalName: 'olive oil', aliases: ['olive oil', 'extra virgin olive oil'] },
  { id: 'garlic', canonicalName: 'garlic', aliases: ['garlic clove', 'garlic cloves'] },
  { id: 'egg', canonicalName: 'egg', aliases: ['eggs'] },
  { id: 'cheese', canonicalName: 'cheese', aliases: ['parmesan', 'mozzarella', 'cheddar'] },
];

export const RECIPES: Recipe[] = [
  {
    id: 'simple-tomato-pasta',
    title: 'Simple Tomato Pasta',
    description: 'A quick pasta with tomatoes, garlic, and olive oil.',
    timeMinutes: 20,
    difficulty: 'easy',
    ingredients: [
      { ingredientId: 'pasta' },
      { ingredientId: 'tomato' },
      { ingredientId: 'olive_oil' },
      { ingredientId: 'garlic', optional: true },
      { ingredientId: 'cheese', optional: true },
    ],
    steps: [
      'Boil pasta in salted water.',
      'Sauté garlic in olive oil.',
      'Add chopped tomatoes and cook until saucy.',
      'Toss pasta with sauce and top with cheese.',
    ],
  },
  {
    id: 'cheesy-eggs',
    title: 'Cheesy Scrambled Eggs',
    description: 'Soft scrambled eggs with cheese.',
    timeMinutes: 10,
    difficulty: 'easy',
    ingredients: [
      { ingredientId: 'egg' },
      { ingredientId: 'cheese' },
      { ingredientId: 'olive_oil', optional: true },
    ],
    steps: [
      'Beat eggs in a bowl.',
      'Heat a pan with a bit of oil.',
      'Cook eggs on low heat, stirring gently.',
      'Stir in cheese before serving.',
    ],
  },
];