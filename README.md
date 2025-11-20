# PantryPal

PantryPal is a Next.js app that suggests recipes based on the ingredients you have. It pairs a friendly UI with a Prisma/Postgres backend and an Ollama-powered worker that normalizes raw recipe data into a searchable catalog.

## Features
- Add pantry items manually and request matching recipes.
- API endpoint (`POST /api/recipes/suggest`) that scores recipes by required/optional ingredients.
- Data pipeline to import a large CSV of raw recipes, normalize them via an Ollama model, and store structured recipes/ingredients.
- Docker compose stack for Postgres, pgAdmin, Ollama, and a worker.

## Stack
- Next.js 16, React 19, TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- Ollama (LLM normalization worker)

## Prerequisites
- Node.js 20+ and npm
- Docker (for Postgres/Ollama)
- `data/RAW_recipes.csv` (Food.com dataset format)

## Environment
Create a `.env` with at least:


## Quick start (local)
1) Install deps: `npm install`  
2) Start Postgres (and optional pgAdmin/Ollama): `docker-compose up -d db pgadmin ollama`  
3) Generate Prisma client: `npm run prisma:generate`  
4) Apply migrations: `npm run prisma:migrate`  
5) Run dev server: `npm run dev` and open http://localhost:3000

## Data pipeline
1) Place `RAW_recipes.csv` in `data/`.  
2) Import raw rows: `npm run import:raw` (uses `scripts/import-raw-recipes.ts`).  
3) Normalize and persist recipes/ingredients with Ollama:
   ```bash
   npx ts-node scripts/process-raw-recipes.ts
