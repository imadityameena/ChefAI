import { useState, useEffect } from "react";
import {
  Bot,
  ChefHat,
  ClipboardList,
  Clock,
  Flame,
  Leaf,
  Loader2,
  Plus,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import BrandLogo from "../components/BrandLogo";
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
  { value: "quick", label: "Quick", hint: "Under 30 min" },
  { value: "medium", label: "Balanced", hint: "30-60 min" },
  { value: "long", label: "Slow craft", hint: "Over 60 min" },
];

const SAMPLE_INGREDIENTS = ["tomatoes", "paneer", "rice", "spinach", "eggs"];

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

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await api.get("/users/profile");
        const preferences = response.data.data.preferences;

        if (preferences) {
          if (preferences.dietary_restrictions?.length > 0) {
            setDietaryRestrictions(preferences.dietary_restrictions);
          }

          if (preferences.preferred_cuisines?.length > 0) {
            setCuisineType(preferences.preferred_cuisines[0]);
          }

          if (preferences.default_servings) {
            setServings(preferences.default_servings);
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, []);

  const addIngredient = (value = inputValue) => {
    const ingredient = value.trim();

    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
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
      toast.success("ChefAI cooked up a recipe!");
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
    <div className="kitchen-page">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="chefai-dark-card mb-7 overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                <Sparkles className="h-4 w-4 text-amber-300" />
                ChefAI Studio
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">
                Cook smarter from whatever is already in your kitchen.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Add ingredients, set your preferences, and let ChefAI shape a
                practical recipe with timing, nutrition, and step-by-step flow.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <BrandLogo compact />
                <div>
                  <div className="text-xl font-black tracking-tight text-white">
                    Chef<span className="text-amber-300">AI</span>
                  </div>
                  <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/45">
                    Recipe Studio
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <HeroMetric label="Items" value={ingredients.length || "0"} />
                <HeroMetric label="Serves" value={servings} />
                <HeroMetric
                  label="Mode"
                  value={
                    cookingTime === "medium" ? "Bal" : cookingTime.slice(0, 3)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="space-y-6">
            <section className="chefai-glass rounded-[1.5rem] p-5 sm:p-6">
              <SectionHeading
                icon={<ClipboardList className="h-5 w-5" />}
                eyebrow="Step 1"
                title="Build the basket"
                description="Use pantry mode or type the ingredients you want ChefAI to work with."
              />

              <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span>
                  <span className="block text-sm font-bold text-emerald-900">
                    Use my pantry
                  </span>
                  <span className="text-xs text-emerald-800">
                    Let ChefAI include your saved ingredients.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={usePantry}
                  onChange={(event) => setUsePantry(event.target.checked)}
                  className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleIngredientKeyDown}
                  placeholder="Add ingredient, e.g. basil, tofu, mango"
                  className="chefai-input h-14 min-w-0 flex-1 rounded-2xl px-4 text-sm text-slate-900 transition"
                />

                <button
                  type="button"
                  onClick={() => addIngredient()}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white transition hover:bg-emerald-600"
                  aria-label="Add ingredient"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="rounded-full text-slate-400 transition hover:text-red-600"
                      aria-label={`Remove ${ingredient}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {ingredients.length === 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Try
                  </span>
                  {SAMPLE_INGREDIENTS.map((ingredient) => (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => addIngredient(ingredient)}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="chefai-glass rounded-[1.5rem] p-5 sm:p-6">
              <SectionHeading
                icon={<ChefHat className="h-5 w-5" />}
                eyebrow="Step 2"
                title="Tune the style"
                description="Choose the cuisine, timing, portions, and dietary guardrails."
              />

              <div className="mt-5 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Cuisine
                  </label>
                  <select
                    value={cuisineType}
                    onChange={(event) => setCuisineType(event.target.value)}
                    className="chefai-input h-14 w-full rounded-2xl px-4 text-sm text-slate-900 transition"
                  >
                    {CUISINES.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    Dietary notes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => {
                      const active = dietaryRestrictions.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleDietary(option)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                            active
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                          }`}
                        >
                          <Leaf className="h-3.5 w-3.5" />
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-800">
                    <span>Servings</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      {servings}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={servings}
                    onChange={(event) =>
                      setServings(Number(event.target.value))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    Cooking pace
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {COOKING_TIMES.map((option) => {
                      const active = cookingTime === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCookingTime(option.value)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-emerald-200 bg-emerald-500 text-white shadow-lg"
                              : "border-gray-200 bg-white/75 text-slate-800 hover:bg-white"
                          }`}
                        >
                          <Flame className="mb-3 h-5 w-5" />
                          <span className="block text-sm font-black">
                            {option.label}
                          </span>
                          <span
                            className={`mt-1 block text-xs ${active ? "text-white/75" : "text-slate-500"}`}
                          >
                            {option.hint}
                          </span>
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
              className="flex h-16 w-full items-center justify-center gap-3 rounded-[1.35rem] bg-emerald-600 px-6 text-base font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  ChefAI is plating...
                </>
              ) : (
                <>
                  <WandSparkles className="h-5 w-5" />
                  Generate with ChefAI
                </>
              )}
            </button>
          </div>

          <section className="chefai-glass min-h-[45rem] rounded-[1.5rem] p-5 sm:p-6">
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

const HeroMetric = ({ label, value }) => (
  <div className="rounded-2xl bg-white/10 p-3 text-center">
    <div className="text-xl font-black text-white">{value}</div>
    <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/50">
      {label}
    </div>
  </div>
);

const SectionHeading = ({ icon, eyebrow, title, description }) => (
  <div className="flex gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
      {icon}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  </div>
);

const NutritionBadge = ({ label, value, unit }) => (
  <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
    <div className="text-xl font-black text-gray-900">
      {value}
      {unit}
    </div>
    <div className="mt-1 text-xs font-semibold text-gray-600">{label}</div>
  </div>
);

const EmptyRecipeState = () => (
  <div className="flex min-h-[38rem] items-center justify-center text-center">
    <div className="max-w-md">
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-emerald-600 shadow-lg">
        <Bot className="h-12 w-12" />
      </div>

      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
        ChefAI is ready
      </p>
      <h3 className="text-2xl font-black text-slate-900">
        Your recipe brief will become a full cooking plan here.
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Add a few ingredients or enable pantry mode, tune the preferences, and
        ChefAI will return a complete recipe card.
      </p>
    </div>
  </div>
);

const GeneratingState = () => (
  <div className="flex min-h-[38rem] items-center justify-center text-center">
    <div className="max-w-sm">
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-600 shadow-lg">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>

      <h3 className="text-2xl font-black text-slate-900">
        ChefAI is composing your recipe
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Balancing ingredients, cuisine, portions, timing, and dietary notes.
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
      <div className="mb-6 rounded-[1.35rem] bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
              ChefAI recipe
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {recipe.name}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {recipe.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {saving ? "Saving..." : "Save Recipe"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <RecipePill
            label={recipe.cuisineType || recipe.cuisine_type || "Custom"}
          />
          <RecipePill label={recipe.difficulty || "medium"} tone="slate" />
          <RecipePill label={`${prepTime} min prep`} tone="slate" />
          <RecipePill label={`${cookTime} min cook`} tone="slate" />
          <RecipePill label={`${servings} servings`} tone="slate" />
          {dietaryTags.map((tag) => (
            <RecipePill key={tag} label={tag} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Clock className="h-5 w-5" />}
          label="Prep"
          value={`${prepTime}m`}
        />
        <StatTile
          icon={<Users className="h-5 w-5" />}
          label="Servings"
          value={servings}
        />
        <StatTile
          icon={<ChefHat className="h-5 w-5" />}
          label="Cook"
          value={`${cookTime}m`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h4 className="text-base font-black text-slate-900">Ingredients</h4>
          <div className="mt-3 space-y-2">
            {ingredients.map((ingredient, index) => {
              const name =
                typeof ingredient === "string" ? ingredient : ingredient.name;
              const quantity =
                typeof ingredient === "string" ? "" : ingredient.quantity;
              const unit =
                typeof ingredient === "string" ? "" : ingredient.unit;

              return (
                <div
                  key={`${name}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm"
                >
                  <span className="font-bold text-slate-900">{name}</span>
                  <span className="text-right text-slate-500">
                    {quantity ? `${quantity} ${unit || ""}`.trim() : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-base font-black text-slate-900">Nutrition</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NutritionBadge
              label="Calories"
              value={nutrition.calories ?? "-"}
              unit=""
            />
            <NutritionBadge
              label="Protein"
              value={nutrition.protein ?? "-"}
              unit="g"
            />
            <NutritionBadge
              label="Carbs"
              value={nutrition.carbs ?? "-"}
              unit="g"
            />
            <NutritionBadge
              label="Fats"
              value={nutrition.fats ?? "-"}
              unit="g"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h4 className="text-base font-black text-slate-900">Instructions</h4>
          <ol className="mt-3 space-y-3">
            {instructions.map((instruction, index) => (
              <li
                key={`${instruction}-${index}`}
                className="flex gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.cookingTips?.length > 0 && (
          <div>
            <h4 className="text-base font-black text-slate-900">Chef notes</h4>
            <ul className="mt-3 space-y-2">
              {recipe.cookingTips.map((tip, index) => (
                <li
                  key={`${tip}-${index}`}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
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
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black ${toneClasses}`}
    >
      {label}
    </span>
  );
};

const StatTile = ({ icon, label, value }) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-white/75 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <p className="text-lg font-black text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

export default RecipeGenerator;
