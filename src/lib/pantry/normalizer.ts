import { prisma } from "@/server/db/client";
import type { PantryItemInput } from "./types";

export async function normalizePantryItems(
  pantry: PantryItemInput[],
): Promise<{ ingredientId: string; name: string }[]> {
  const cleanedNames = pantry
    .map(p => p.name.trim().toLowerCase())
    .filter(Boolean);

  if (!cleanedNames.length) return [];

  // exact alias lookup
  const aliases = await prisma.ingredientAlias.findMany({
    where: {
      aliasName: { in: cleanedNames },
    },
    include: {
      ingredient: true,
    },
  });

  const byAlias = new Map(
    aliases.map(a => [a.aliasName.toLowerCase(), a.ingredient]),
  );

  const mapped: { ingredientId: string; name: string }[] = [];

  for (const item of pantry) {
    const key = item.name.trim().toLowerCase();
    const ing = byAlias.get(key);
    if (!ing) continue;

    mapped.push({
      ingredientId: ing.id,
      name: ing.canonicalName,
    });
  }

  const unique = new Map<string, { ingredientId: string; name: string }>();
  for (const m of mapped) unique.set(m.ingredientId, m);

  return Array.from(unique.values());
}
