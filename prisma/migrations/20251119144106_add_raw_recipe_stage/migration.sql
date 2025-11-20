-- CreateTable
CREATE TABLE "raw_recipes" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "rawJson" JSONB NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "raw_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_recipes_source_processed_idx" ON "raw_recipes"("source", "processed");
