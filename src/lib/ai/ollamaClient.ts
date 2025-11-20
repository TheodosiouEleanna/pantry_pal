// src/lib/ai/ollamaClient.ts
const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "phi3:mini";

type OllamaGenerateResponse = {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
};

function buildPrompt(raw: unknown): string {
  const rawString = JSON.stringify(raw, null, 2);

  return `
You are a strict JSON API for recipe normalization.

Given a raw recipe object, you MUST return a single JSON object with this exact shape:

{
  "title": string,
  "description": string | null,
  "timeMinutes": number | null,
  "difficulty": "easy" | "medium" | "hard" | null,
  "ingredients": [
    {
      "name": string,
      "amount": number | null,
      "unit": string | null
    }
  ],
  "steps": string[]
}

Rules:
- The response MUST be valid JSON that can be parsed by JSON.parse in JavaScript.
- Use double quotes for all keys and string values.
- Do NOT use trailing commas.
- Do NOT include comments.
- Do NOT output code, pseudocode, or explanations.
- Do NOT wrap the JSON in markdown code fences.
- Do NOT add any text before or after the JSON.

Here is the raw recipe object:

${rawString}
`;
}

function extractJson(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
  }

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1);
  }

  return cleaned.trim();
}

// If you already have this type elsewhere, import it instead.
export type NormalizedRecipe = {
  title: string;
  description: string | null;
  timeMinutes: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  ingredients: { name: string; amount: number | null; unit: string | null }[];
  steps: string[];
};

export async function normalizeRecipeWithOllama(
  raw: unknown,
): Promise<NormalizedRecipe | null> {
  const prompt = buildPrompt(raw);

  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      // if the model supports it, this helps a lot; if not, it’s ignored
      format: "json",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `Ollama request failed: ${res.status} ${res.statusText} - ${body}`,
    );
    return null;
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  const rawResponse = extractJson(data.response);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawResponse);
  } catch (e) {
    console.error("Failed to parse Ollama JSON:", rawResponse, e);
    return null;
  }

  // Very light validation. If it misses these, we just skip.
  if (
    !parsed ||
    typeof parsed.title !== "string" ||
    !Array.isArray(parsed.ingredients)
  ) {
    console.error("Ollama JSON not in expected shape:", parsed);
    return null;
  }

  const normalized: NormalizedRecipe = {
    title: parsed.title,
    description:
      typeof parsed.description === "string" ? parsed.description : null,
    timeMinutes:
      typeof parsed.timeMinutes === "number" ? parsed.timeMinutes : null,
    difficulty:
      parsed.difficulty === "easy" ||
      parsed.difficulty === "medium" ||
      parsed.difficulty === "hard"
        ? parsed.difficulty
        : null,
    ingredients: parsed.ingredients.map((ing: {name: string; amount: number | null; unit: string | null}) => ({
      name: typeof ing?.name === "string" ? ing.name : "",
      amount: typeof ing?.amount === "number" ? ing.amount : null,
      unit: typeof ing?.unit === "string" ? ing.unit : null,
    })),
    steps: Array.isArray(parsed.steps)
      ? parsed.steps.map((s: string) => String(s ?? ""))
      : [],
  };

  return normalized;
}
