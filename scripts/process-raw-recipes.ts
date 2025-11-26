import { prisma } from "../src/server/db/client";
import { normalizeRecipeWithOllama } from "../src/lib/ai/ollamaClient";
import { randomUUID } from "crypto";
import { normalizeIngredientKey } from "../src/lib/pantry/normalizer";

async function processBatch(limit = 10): Promise<number> {
  const rawRecipes = await prisma.rawRecipe.findMany({
    where: { processed: false },
    take: limit,
  });

  if (rawRecipes.length === 0) {
    console.log("No unprocessed raw recipes.");
    return 0;
  }

  console.log(`Processing ${rawRecipes.length} raw recipes...`);

  let processed = 0;

  for (const raw of rawRecipes) {
    try {
      const normalizedJson = await normalizeRecipeWithOllama(raw.rawJson);

      if (
        !normalizedJson ||
        !normalizedJson.title ||
        !Array.isArray(normalizedJson.ingredients) ||
        normalizedJson.ingredients.length === 0
      ) {
        console.warn(
          `Invalid normalized recipe for raw recipe ${raw.id}, marking processed and skipping.`,
        );
        await prisma.rawRecipe.update({
          where: { id: raw.id },
          data: { processed: true },
        });
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const ingredientCache = new Map<string, string>();

        async function getOrCreateIngredientId(name: string): Promise<string> {
          const cached = ingredientCache.get(name);
          if (cached) return cached;

          const alias = await tx.ingredientAlias.findFirst({
            where: { aliasName: name },
            include: { ingredient: true },
          });

          if (alias) {
            ingredientCache.set(name, alias.ingredientId);
            return alias.ingredientId;
          }

          const ingredientId = randomUUID();

          const ingredient = await tx.ingredient.create({
            data: {
              id: ingredientId,
              canonicalName: name,
            },
          });

          await tx.ingredientAlias.create({
            data: {
              id: randomUUID(),
              ingredientId: ingredient.id,
              aliasName: name,
            },
          });

          ingredientCache.set(name, ingredient.id);
          return ingredient.id;
        }

        const recipeIngredientData: {
          id: string;
          recipeId: string;
          ingredientId: string;
          amount: number | null;
          unit: string | null;
          optional: boolean;
        }[] = [];

        const difficulty =
          normalizedJson.difficulty === "easy" ||
          normalizedJson.difficulty === "medium" ||
          normalizedJson.difficulty === "hard"
            ? normalizedJson.difficulty
            : null;

        const recipeId = randomUUID();

        for (const ing of normalizedJson.ingredients) {
          const rawName = ing.name ?? "";
          const name = normalizeIngredientKey(rawName);
          if (!name) continue;

          const ingredientId = await getOrCreateIngredientId(name);

          recipeIngredientData.push({
            id: randomUUID(),
            recipeId,
            ingredientId,
            amount: ing.amount ?? null,
            unit: ing.unit ?? null,
            optional: false,
          });
        }

        if (recipeIngredientData.length === 0) {
          console.warn(
            `No usable ingredients for raw recipe ${raw.id}, marking processed and skipping.`,
          );
          await tx.rawRecipe.update({
            where: { id: raw.id },
            data: { processed: true },
          });
          return;
        }

        const baseSlug = normalizedJson.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80);

        await tx.recipe.create({
          data: {
            id: recipeId,
            slug: `${baseSlug}-${recipeId.slice(0, 8)}`,
            title: normalizedJson.title,
            description: normalizedJson.description ?? null,
            timeMinutes: normalizedJson.timeMinutes ?? null,
            difficulty,
            isActive: true,
          },
        });

        await tx.recipeIngredient.createMany({
          data: recipeIngredientData,
        });

        await tx.rawRecipe.update({
          where: { id: raw.id },
          data: { processed: true },
        });
      });

      processed += 1;
      console.log(`Processed raw recipe ${raw.id}`);
    } catch (err) {
      console.error(`Failed to process raw recipe ${raw.id}`, err);
      // still not marking as processed so you can inspect later
    }
  }

  return processed;
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
      console.log(
        `No recipes processed in this batch. Remaining unprocessed: ${remainingAfter}`,
      );
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
    await prisma.$disconnect();
  });