import {
  PantryItemInput,
  SuggestedRecipe,
  SuggestRecipesOptions,
} from "@/lib/pantry/types";
import { normalizePantryItems } from "@/lib/pantry/normalizer";
import { getCandidateRecipesByIngredients } from "@/lib/pantry/recipes.repo";

export async function suggestRecipes(
  pantryItems: PantryItemInput[],
  options: SuggestRecipesOptions = {},
): Promise<SuggestedRecipe[]> {
  const normalized = await normalizePantryItems(pantryItems);
  if (!normalized.length) return [];

  const ingredientIds = normalized.map(n => n.ingredientId);
  const recipes = await getCandidateRecipesByIngredients(ingredientIds);
  if (!recipes.length) return [];

  const pantrySet = new Set(ingredientIds);
  const max = options.maxResults ?? 5;

  const scored: SuggestedRecipe[] = [];

  for (const recipe of recipes) {
    const required = recipe.ingredients.filter(i => !i.optional);
    const optional = recipe.ingredients.filter(i => i.optional);

    const usedRequired = required.filter(r => pantrySet.has(r.ingredientId));
    const usedOptional = optional.filter(r => pantrySet.has(r.ingredientId));

    const missingRequired = required.filter(
      r => !pantrySet.has(r.ingredientId),
    );
    const missingOptional = optional.filter(
      r => !pantrySet.has(r.ingredientId),
    );

    if (usedRequired.length === 0) continue;

    const matchRatio =
      required.length > 0 ? usedRequired.length / required.length : 0;

    const optionalRatio =
      optional.length > 0 ? usedOptional.length / optional.length : 0;

    const score = matchRatio * 0.7 + optionalRatio * 0.3;

    scored.push({
      id: recipe.id,
      title: recipe.title,
      score,
      description: recipe.description ?? undefined,
      timeMinutes: recipe.timeMinutes ?? undefined,
      difficulty: recipe.difficulty ?? undefined,
      steps: [], 
      usedIngredients: [...usedRequired, ...usedOptional].map(r => ({
        name: r.ingredient.canonicalName,
      })),
      missingIngredients: [...missingRequired, ...missingOptional].map(r => ({
        name: r.ingredient.canonicalName,
        optional: r.optional,
      })),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max);
}
