import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shape of a single row in RAW_recipes.csv
type RawFoodComRecipeRow = {
  id: string;
  name: string;
  minutes: string;
  contributor_id: string;
  submitted: string;
  tags: string;
  nutrition: string;
  n_steps: string;
  steps: string;
  description: string;
  ingredients: string;
  n_ingredients: string;
};

async function main() {
  const filePath = path.join(__dirname, "..", "data", "RAW_recipes.csv");

  if (!fs.existsSync(filePath)) {
    throw new Error(`RAW_recipes.csv not found at: ${filePath}`);
  }

  const stream = fs
    .createReadStream(filePath)
    .pipe(
      parse({
        columns: true,
        trim: true,
      }),
    );

  const batchSize = 1000;
  let batch: {
    id: string;
    source: string;
    externalId: string | null;
    rawJson: RawFoodComRecipeRow;
    processed: boolean;
  }[] = [];

  let total = 0;

  for await (const row of stream as AsyncIterable<RawFoodComRecipeRow>) {
    batch.push({
      id: randomUUID(),
      source: "foodcom",
      externalId: row.id ?? null,
      rawJson: row,    
      processed: false, 
    });

    if (batch.length >= batchSize) {
      await prisma.rawRecipe.createMany({
        data: batch,
        skipDuplicates: true, // uses @@unique([source, externalId])
      });
      total += batch.length;
      console.log(`Imported ${total} raw recipes so far...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await prisma.rawRecipe.createMany({
      data: batch,
      skipDuplicates: false,
    });
    total += batch.length;
  }

  console.log(`Done. Imported ${total} raw recipes.`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });