export type SuggestedRecipe = {
  id: string;
  title: string;
  score: number;
  missingIngredients: { name: string; optional: boolean }[];
  usedIngredients: { name: string }[];
  timeMinutes?: number;
  difficulty?: "easy" | "medium" | "hard";
  steps: string[];
  description?: string;
};

type RecipeListProps = {
  recipes: SuggestedRecipe[];
  error: string | null;
  isLoading: boolean;
  hasRequested: boolean;
};

export function RecipeList({
  recipes,
  error,
  isLoading,
  hasRequested,
}: RecipeListProps) {
  return (
    <div className="mt-8 border-t border-emerald-100 pt-5">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">
        Recipe suggestions
      </h3>

      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}

      {!error && hasRequested && !isLoading && recipes.length === 0 && (
        <p className="text-sm text-gray-600">
          No recipes matched your ingredients yet. Try adding things like{" "}
          <span className="font-semibold">tomato, pasta, olive oil</span> or{" "}
          <span className="font-semibold">egg, cheese</span>.
        </p>
      )}

      {!error && recipes.length > 0 && (
        <div className="space-y-4">
          {recipes.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-emerald-100 bg-white/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    {r.title}
                  </h4>
                  {r.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {r.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {r.timeMinutes && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                      {r.timeMinutes} min
                    </span>
                  )}
                  {r.difficulty && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                      {r.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-medium text-gray-800">
                    Uses from your pantry:
                  </p>
                  {r.usedIngredients.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {r.usedIngredients.map((u, idx) => (
                        <li
                          key={idx}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900"
                        >
                          {u.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">
                      None matched, which is odd.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 font-medium text-gray-800">
                    Missing ingredients:
                  </p>
                  {r.missingIngredients.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {r.missingIngredients.map((m, idx) => (
                        <li
                          key={idx}
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            m.optional
                              ? "bg-gray-50 text-gray-700"
                              : "bg-orange-50 text-orange-800"
                          }`}
                        >
                          {m.name}
                          {m.optional && " (optional)"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">
                      You have everything for this one.
                    </p>
                  )}
                </div>
              </div>

              {r.steps?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 font-medium text-gray-800">Steps:</p>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                    {r.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
