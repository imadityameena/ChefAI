import { useState, useEffect } from "react";
import {
  ChefHat,
  Sparkles,
  Plus,
  X,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";

const CUISINES = [
  "Any",
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Japanese",
  "Thai",
  "French",
  "Mediterranean",
  "American",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
];

const COOKING_TIMES = [
  { value: "quick", label: "Quick (<30 min)" },
  { value: "medium", label: "Medium (30-60 min)" },
  { value: "long", label: "Long (>60 min)" },
];

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [usePantry, setUsePantry] = useState(false);
  const [cuisineType, setCuisineType] = useState("Any");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [servings, setServings] = useState(4);
  const [cookingTime, setCookingTime] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Load user preferences on component mount
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await api.get("/users/profile");
        const preferences = response.data.data.preferences;

        if (preferences) {
          // Auto-fill dietary restrictions
          if (
            preferences.dietary_restrictions &&
            preferences.dietary_restrictions.length > 0
          ) {
            setDietaryRestrictions(preferences.dietary_restrictions);
          }

          // Auto-fill preferred cuisine
          if (
            preferences.preferred_cuisines &&
            preferences.preferred_cuisines.length > 0
          ) {
            setCuisineType(preferences.preferred_cuisines[0]);
          }

          // Auto-fill default servings
          if (preferences.default_servings) {
            setServings(preferences.default_servings);
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      } finally {
        setPreferencesLoaded(true);
      }
    };

    fetchUserPreferences();
  }, []);

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleIngredientKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const toggleDietary = (option) => {
    if (dietaryRestrictions.includes(option)) {
      setDietaryRestrictions(dietaryRestrictions.filter((d) => d !== option));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, option]);
    }
  };

  const handleGenerate = async () => {
    if (!usePantry && ingredients.length === 0) {
      toast.error("Please add at least one ingredient or use pantry items");
      return;
    }

    setGenerating(true);
    setGeneratedRecipe(null);

    try {
      const response = await api.post("/recipes/generate", {
        ingredients,
        usePantryIngredients: usePantry,
        dietaryRestrictions,
        cuisineType: cuisineType === "Any" ? "any" : cuisineType,
        servings,
        cookingTime,
      });

      setGeneratedRecipe(response.data.data.recipe);

      toast.success("Recipe generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate recipe");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    setSaving(true);

    try {
      await api.post("/recipes", {
        name: generatedRecipe.name,
        description: generatedRecipe.description,
        cuisine_type: generatedRecipe.cuisineType,
        difficulty: generatedRecipe.difficulty,
        prep_time: generatedRecipe.prepTime,
        cook_time: generatedRecipe.cookTime,
        servings: generatedRecipe.servings,
        instructions: generatedRecipe.instructions,
        dietary_tags: generatedRecipe.dietaryTags || [],
        ingredients: generatedRecipe.ingredients,
        nutrition: generatedRecipe.nutrition,
      });

      toast.success("Recipe saved to your collection!");
    } catch (error) {
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Sparkles className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Recipe Generator
          </h1>

          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Let AI create delicious recipes based on your ingredients
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ChefHat className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Ingredients
                  </h2>

                  <p className="text-sm text-slate-500">
                    Add items you have on hand or use ingredients from your pantry.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                <input
                  type="checkbox"
                  checked={usePantry}
                  onChange={(event) => setUsePantry(event.target.checked)}
                  className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />

                <span>Use ingredients from my pantry</span>
              </label>

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleIngredientKeyDown}
                  placeholder="Add ingredient (e.g., tomatoes)"
                  className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  onClick={addIngredient}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label="Add ingredient"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {ingredients.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {ingredient}

                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient)}
                        className="rounded-full text-slate-400 transition hover:text-slate-700"
                        aria-label={`Remove ${ingredient}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No ingredients added yet. Add a few to get started.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-slate-900">
                Preferences
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cuisine Type
                  </label>

                  <select
                    value={cuisineType}
                    onChange={(event) => setCuisineType(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {CUISINES.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Dietary Restrictions
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => {
                      const active = dietaryRestrictions.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleDietary(option)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Servings</span>
                    <span className="text-slate-500">{servings}</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={servings}
                    onChange={(event) => setServings(Number(event.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-500"
                  />

                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>12</span>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Cooking Time
                  </label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {COOKING_TIMES.map((option) => {
                      const active = cookingTime === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCookingTime(option.value)}
                          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                            active
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Recipe
                </>
              )}
            </button>
          </div>

          <section className="min-h-180 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {generating ? (
              <GeneratingState />
            ) : generatedRecipe ? (
              <RecipeResult
                recipe={generatedRecipe}
                saving={saving}
                onSave={handleSaveRecipe}
              />
            ) : (
              <EmptyRecipeState />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const NutritionBadge = ({ label, value, unit }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <div className="text-lg font-bold text-gray-900">
      {value}
      {unit}
    </div>

    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

const EmptyRecipeState = () => (
  <div className="flex min-h-155 items-center justify-center text-center">
    <div className="max-w-sm">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-300">
        <ChefHat className="h-10 w-10" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        Your generated recipe will appear here
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Pick a cuisine, add a few ingredients, and generate a recipe to see the
        full breakdown on this side.
      </p>
    </div>
  </div>
);

const GeneratingState = () => (
  <div className="flex min-h-155 items-center justify-center text-center">
    <div>
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        Generating your recipe
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Finding the best balance of ingredients, cuisine, and cooking time.
      </p>
    </div>
  </div>
);

const RecipeResult = ({ recipe, saving, onSave }) => {
  const prepTime = recipe.prepTime ?? recipe.prep_time ?? 0;
  const cookTime = recipe.cookTime ?? recipe.cook_time ?? 0;
  const servings = recipe.servings ?? 4;
  const dietaryTags = recipe.dietaryTags ?? recipe.dietary_tags ?? [];
  const ingredients = recipe.ingredients ?? [];
  const instructions = recipe.instructions ?? [];
  const nutrition = recipe.nutrition ?? {};

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
            AI Generated Recipe
          </p>

          <h3 className="mt-1 text-2xl font-bold text-slate-900">
            {recipe.name}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {recipe.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {saving ? "Saving..." : "Save Recipe"}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <RecipePill label={recipe.cuisineType || recipe.cuisine_type || "Custom"} />

        <RecipePill label={recipe.difficulty || "medium"} tone="slate" />

        <RecipePill label={`${prepTime} min prep`} tone="slate" />

        <RecipePill label={`${cookTime} min cook`} tone="slate" />

        <RecipePill label={`${servings} servings`} tone="slate" />

        {dietaryTags.map((tag) => (
          <RecipePill key={tag} label={tag} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={<Clock className="h-5 w-5" />} label="Prep" value={`${prepTime}m`} />

        <StatTile icon={<Users className="h-5 w-5" />} label="Servings" value={servings} />

        <StatTile icon={<ChefHat className="h-5 w-5" />} label="Cook" value={`${cookTime}m`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900">Ingredients</h4>

          <div className="mt-3 space-y-2">
            {ingredients.map((ingredient, index) => {
              const name = typeof ingredient === "string" ? ingredient : ingredient.name;
              const quantity = typeof ingredient === "string" ? "" : ingredient.quantity;
              const unit = typeof ingredient === "string" ? "" : ingredient.unit;

              return (
                <div
                  key={`${name}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <span className="font-medium text-slate-900">{name}</span>

                  <span className="text-slate-500">
                    {quantity ? `${quantity} ${unit || ""}`.trim() : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-slate-900">Nutrition</h4>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <NutritionBadge label="Calories" value={nutrition.calories ?? "-"} unit="" />
            <NutritionBadge label="Protein" value={nutrition.protein ?? "-"} unit="g" />
            <NutritionBadge label="Carbs" value={nutrition.carbs ?? "-"} unit="g" />
            <NutritionBadge label="Fats" value={nutrition.fats ?? "-"} unit="g" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900">Instructions</h4>

          <ol className="mt-3 space-y-3">
            {instructions.map((instruction, index) => (
              <li
                key={`${instruction}-${index}`}
                className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                  {index + 1}
                </span>

                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.cookingTips?.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-slate-900">Cooking Tips</h4>

            <ul className="mt-3 space-y-2">
              {recipe.cookingTips.map((tip, index) => (
                <li
                  key={`${tip}-${index}`}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const RecipePill = ({ label, tone = "emerald" }) => {
  const toneClasses =
    tone === "slate"
      ? "bg-slate-100 text-slate-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}>
      {label}
    </span>
  );
};

const StatTile = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

export default RecipeGenerator;
