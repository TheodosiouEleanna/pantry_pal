import { prisma } from "@/server/db/client";

export async function getCandidateRecipesByIngredients(
  ingredientIds: string[],
  limit = 200,
) {

  const recipeIngredients = await prisma.recipeIngredient.groupBy({
    by: ["recipeId"],
    where: {
      ingredientId: { in: ingredientIds },
    },
    _count: {
      ingredientId: true,
    },
    orderBy: {
      _count: {
        ingredientId: "desc",
      },
    },
    take: limit,
  });

  console.log(`Found ${recipeIngredients.length} candidate recipes for ingredients.`);

  const recipeIds = recipeIngredients.map(r => r.recipeId);

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: recipeIds }, isActive: true },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  return recipes;
}
