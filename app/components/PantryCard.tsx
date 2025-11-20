"use client";
import { useMemo, useRef, useState } from "react";
import { XIcon } from "./Icons";
import Image from "next/image";
import { RecipeList } from "./RecipeList";

type Unit = "pcs" | "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup";
type Ingredient = { id: string; name: string; qty: number; unit: Unit };
type Photo = { id: string; url: string; name: string };

const UNITS: Unit[] = ["pcs", "g", "kg", "ml", "l", "tsp", "tbsp", "cup"];

type SuggestedRecipe = {
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

export default function PantryCard() {
  const [mode, setMode] = useState<"type" | "photo">("type");
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number | "">("");
  const [unit, setUnit] = useState<Unit>("pcs");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [recipes, setRecipes] = useState<SuggestedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const canAdd = useMemo(() => {
    const q = typeof qty === "number" ? qty : NaN;
    return name.trim().length > 0 && Number.isFinite(q) && q > 0;
  }, [name, qty]);

  function addItem() {
    if (!canAdd) return;
    setItems((s) => [
      ...s,
      { id: crypto.randomUUID(), name: name.trim(), qty: qty as number, unit },
    ]);
    setName("");
    setQty("");
    setUnit("pcs");
  }

  function removeItem(id: string) {
    setItems((s) => s.filter((x) => x.id !== id));
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newPhotos: Photo[] = files.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearPhotos() {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function scanPhotos() {
    if (!photos.length) return;
    console.log("Scan photos placeholder", photos);
  }

  function clearItems() {
    setItems([]);
  }

  async function suggestRecipes() {
    if (!items.length || isLoading) return;
    setIsLoading(true);
    setError(null);
    setHasRequested(true);

    try {
      const res = await fetch("/api/recipes/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            name: it.name,
            qty: it.qty,
            unit: it.unit,
          })),
          maxResults: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching recipe suggestions.");
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto mb-24 w-[min(960px,92%)] px-2">
      <div
        className="
        mt-12 rounded-3xl border border-emerald-100/70
        bg-white
        bg-[radial-gradient(120%_80%_at_0%_0%,rgba(16,185,129,0.06),transparent_60%)]
        p-8 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.15)]
      "
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            🥬
          </span>
          <h2 className="text-3xl font-semibold text-gray-900">
            What&apos;s in your kitchen?
          </h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-md bg-stone-100 p-1.5">
          <button
            type="button"
            onClick={() => setMode("type")}
            className={`w-full rounded-lg py-3.5 text-base font-semibold transition-colors ${
              mode === "type"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-900 hover:text-gray-800"
            }`}
          >
            Type Ingredients
          </button>

          <button
            type="button"
            onClick={() => setMode("photo")}
            className={`w-full rounded-lg py-3.5 text-base font-semibold transition-colors ${
              mode === "photo"
                ? "bg-white text-gray-900"
                : "text-gray-900 hover:text-gray-800"
            }`}
          >
            Upload Photos
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFilePicked}
        />

        {mode === "photo" ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            className="cursor-pointer rounded-2xl border border-dashed border-emerald-200/60 bg-emerald-50/20 p-8 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {photos.length ? (
              <div className="mx-auto max-w-3xl space-y-4">
                <div
                  className="flex flex-wrap gap-4"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center gap-3 rounded-md border border-emerald-200 bg-white p-2 pr-3 w-full"
                    >
                      <div className="relative aspect-square w-52 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          fill
                          className="object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {photo.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Click outside cards to add more photos
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="rounded-full border border-orange-600 bg-white px-1 py-1 text-xs text-orange-900 hover:bg-orange-700/30"
                        >
                          <XIcon className="h-4 w-4 " />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="flex flex-wrap items-center gap-3 mt-6"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center font-semibold rounded-lg bg-emerald-700/70 px-3 py-1.5 text-base text-white hover:text-gray-900"
                  >
                    + Add more photos
                  </button>
                  <button
                    type="button"
                    onClick={scanPhotos}
                    disabled={!photos.length}
                    className={`inline-flex items-center font-semibold rounded-lg px-3 py-1.5 text-base ${
                      photos.length
                        ? "bg-emerald-700/70 text-white hover:bg-emerald-600/70 hover:text-gray-900"
                        : "cursor-not-allowed border-emerald-100 bg-emerald-50 text-emerald-300 "
                    }`}
                  >
                    Scan ingredients
                  </button>
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={clearPhotos}
                      className="inline-flex items-center font-semibold rounded-lg border border-orange-700 bg-white px-3 py-[5px] text-base text-orange-900 hover:bg-orange-700/30"
                    >
                      Remove all
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto grid max-w-3xl place-items-center rounded-md border border-dashed border-emerald-200/60 bg-white/70 p-10 text-center">
                <div className="mb-3 text-emerald-700/70">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-800">
                  Upload ingredient photos
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Click to browse and select one or more images
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <form
                className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_minmax(110px,160px)_minmax(110px,160px)_48px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem();
                }}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Add an ingredient..."
                  className="h-12 rounded-md border border-emerald-200/70 px-4 text-base text-gray-900 placeholder:text-emerald-700/60 focus:border-emerald-300 focus:outline-none"
                />
                <input
                  inputMode="decimal"
                  type="number"
                  min={0}
                  step="any"
                  value={qty}
                  onChange={(e) =>
                    setQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Quantity"
                  className="h-12 rounded-md border border-emerald-200/70 px-4 text-base focus:border-emerald-300 focus:outline-none"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                  className="h-12 rounded-md border border-emerald-200/70 px-3 text-base focus:border-emerald-300 focus:outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!canAdd}
                  className={`grid h-12 w-12 place-items-center rounded-md border text-emerald-900 transition active:scale-95 ${
                    canAdd
                      ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      : "cursor-not-allowed border-emerald-100 bg-emerald-50/50 opacity-60"
                  }`}
                  title="Add ingredient"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                </button>
              </form>
            </div>

            <div className="mt-6">
              {items.length === 0 ? (
                <div className="min-h-[48px] text-center">
                  <p className="text-sm text-gray-600">No ingredients yet</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Start adding what you have in your kitchen!
                  </p>
                </div>
              ) : (
                <>
                  <ul className="flex flex-wrap items-center gap-2">
                    {items.map((it) => (
                      <li
                        key={it.id}
                        className="group inline-flex items-center gap-2 rounded-full border border-emerald-700/70 bg-emerald-50 px-3.5 py-1.5 text-emerald-900 hover:bg-emerald-100"
                      >
                        <span className="text-[0.95rem] font-medium text-gray-900">
                          {it.name}
                        </span>
                        <span className="text-emerald-800/80">
                          {it.qty} {it.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          className="ml-1 rounded-full p-1 text-emerald-800/60 hover:bg-emerald-100 hover:text-emerald-900"
                          aria-label={`Remove ${it.name}`}
                          title="Remove"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              d="M6 6l12 12M18 6L6 18"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-start items-center gap-3 mt-8">
                    <button
                      type="button"
                      onClick={suggestRecipes}
                      disabled={!items.length || isLoading}
                      className={`inline-flex items-center rounded-md px-4 py-2 text-base font-semibold ${
                        items.length && !isLoading
                          ? "bg-emerald-700/80 text-white hover:bg-emerald-600/80"
                          : "cursor-not-allowed bg-emerald-100 text-emerald-400"
                      }`}
                    >
                      {isLoading ? "Finding recipes..." : "Suggest recipes"}
                    </button>
                    <button
                      type="button"
                      onClick={clearItems}
                      className="inline-flex items-center rounded-md border font-semibold border-orange-700 bg-white px-3 py-[5px] text-base text-orange-900 hover:bg-orange-700/30"
                    >
                      Remove all
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Recipes section */}
            <RecipeList
              recipes={recipes}
              error={error}
              isLoading={isLoading}
              hasRequested={hasRequested}
            />
          </>
        )}
      </div>
    </section>
  );
}
