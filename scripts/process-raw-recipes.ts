import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import {
  normalizeRecipeWithOllama,
} from "../src/lib/ai/ollamaClient";

const prisma = new PrismaClient();

async function processBatch(limit = 10): Promise<number>{
  const rawRecipes = await prisma.rawRecipe.findMany({
    where: { processed: false },
    take: limit,
  });

  if (rawRecipes.length === 0) {
    console.log("No unprocessed raw recipes.");
    return 0;
  }

  console.log(`Processing ${rawRecipes.length} raw recipes...`);

  for (const raw of rawRecipes) {
    try {
      const normalized = await normalizeRecipeWithOllama(raw.rawJson);

      if (!normalized) {
        console.error(
          `Skipping raw recipe ${raw.id} due to invalid Ollama output`,
        );
        // you can decide whether to mark as processed or leave it for later
        await prisma.rawRecipe.update({
          where: { id: raw.id },
          data: { processed: true },
        });
        continue;
      }

      console.log("Normalized:", normalized.title);

      await prisma.$transaction(async (tx) => {
        const resolvedIngredients: {
          ingredientId: string;
          amount: number | null;
          unit: string | null;
          name: string;
        }[] = [];

        for (const ing of normalized.ingredients) {
          const name = ing.name?.trim().toLowerCase();
          if (!name) continue;

          let ingredientId: string;

          const existingAlias = await tx.ingredientAlias.findFirst({
            where: { aliasName: name },
            select: { ingredientId: true },
          });

          if (existingAlias) {
            ingredientId = existingAlias.ingredientId;
          } else {
            const newIngredientId = randomUUID();

            await tx.ingredient.create({
              data: {
                id: newIngredientId,
                canonicalName: name,
              },
            });

            await tx.ingredientAlias.create({
              data: {
                id: randomUUID(),
                ingredientId: newIngredientId,
                aliasName: name,
              },
            });

            ingredientId = newIngredientId;
          }

          resolvedIngredients.push({
            ingredientId,
            amount: ing.amount ?? null,
            unit: ing.unit ?? null,
            name,
          });
        }

        if (!resolvedIngredients.length) {
          await tx.rawRecipe.update({
            where: { id: raw.id },
            data: { processed: true },
          });
          return;
        }

        const difficulty =
          normalized.difficulty === "easy" ||
          normalized.difficulty === "medium" ||
          normalized.difficulty === "hard"
            ? normalized.difficulty
            : null;

        const recipeId = randomUUID();

        await tx.recipe.create({
          data: {
            id: recipeId,
            slug: `${normalized.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")}-${recipeId.slice(0, 8)}`,
            title: normalized.title,
            description: normalized.description ?? null,
            timeMinutes: normalized.timeMinutes ?? null,
            difficulty,
            isActive: true,
          },
        });

        const recipeIngredientData = resolvedIngredients.map((ri) => ({
          id: randomUUID(),
          recipeId,
          ingredientId: ri.ingredientId,
          amount: ri.amount,
          unit: ri.unit,
          optional: false,
        }));

        await tx.recipeIngredient.createMany({
          data: recipeIngredientData,
        });

        await tx.rawRecipe.update({
          where: { id: raw.id },
          data: { processed: true },
        });
      });

      console.log(`Processed raw recipe ${raw.id}`);
    } catch (err) {
      console.error(`Failed to process raw recipe ${raw.id}`, err);
    }
  }
  return rawRecipes.length;
}

async function main() {
  const BATCH_SIZE = 10;

  while (true) {
    const remainingBefore = await prisma.rawRecipe.count({
      where: { processed: false },
    });

    console.log(`Remaining before batch: ${remainingBefore}`);

    const count = await processBatch(BATCH_SIZE);

    if (count === 0) {
      const remainingAfter = await prisma.rawRecipe.count({
        where: { processed: false },
      });
      console.log(`No more recipes. Remaining unprocessed: ${remainingAfter}`);
      break;
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
