import { NextRequest, NextResponse } from "next/server";
import { suggestRecipes } from "@/lib/pantry/matcher";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];

  const recipes = await suggestRecipes(items, {
    maxResults: body.maxResults ?? 10,
  });

  return NextResponse.json({ recipes });
}