import { prisma } from "../../server/db/client";
import type { PantryItemInput } from "./types";

export async function normalizePantryItems(
  pantry: PantryItemInput[],
): Promise<{ ingredientId: string; name: string }[]> {
  const cleanedNames = pantry
    .map(p => normalizeIngredientKey(p.name))
    .filter(Boolean);

  if (!cleanedNames.length) return [];

  const aliases = await prisma.ingredientAlias.findMany({
    where: {
      aliasName: {
        in: cleanedNames,
      },
    },
    include: {
      ingredient: true,
    },
  });

  const byAlias = new Map(
    aliases.map(a => [normalizeIngredientKey(a.aliasName), a.ingredient]),
  );

  const mapped: { ingredientId: string; name: string }[] = [];

  for (const item of pantry) {
    const key = normalizeIngredientKey(item.name);
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

export function normalizeIngredientKey(raw: string): string {
  let s = raw.trim().toLowerCase();

  s = s.replace(/^[\[\(]+/, "").replace(/[\]\)]+$/, "");

  s = s.replace(/^['"]+/, "").replace(/['"]+$/, "");

  s = s.replace(/,+$/, "");

  s = s.replace(/\s+/g, " ");

  return s;
}