import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Check, Plus, RotateCcw, ShieldAlert, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { COOKING_TIMES, CUISINES, DIETARY_OPTIONS } from '../lib/constants';
import { errorMessage } from '../lib/format';
import RecipeView from '../components/RecipeView';
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  Field,
  Input,
  PageHeader,
  Segmented,
  Select,
  Skeleton,
  Stepper,
  Switch,
} from '../components/ui';

const SUGGESTED = ['tomatoes', 'paneer', 'rice', 'spinach', 'eggs', 'chicken', 'lentils'];

const LOADING_STEPS = ['Reading your ingredients…', 'Balancing flavours…', 'Working out timings…', 'Writing the method…'];

const GeneratingState = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div role="status" aria-live="polite">
      <p className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Sparkles className="size-4 animate-pulse text-brand" aria-hidden="true" />
        {LOADING_STEPS[step]}
      </p>
      <Skeleton className="mb-3 h-4 w-32" />
      <Skeleton className="mb-3 h-10 w-3/4" />
      <Skeleton className="mb-8 h-4 w-full max-w-lg" />
      <Skeleton className="mb-10 h-16 w-full max-w-xl" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyResult = () => (
  <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-16 text-center">
    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
      <Sparkles className="size-5" aria-hidden="true" />
    </div>
    <h2 className="display text-[22px]">Your recipe will appear here</h2>
    <p className="mt-2 max-w-sm text-sm text-muted">
      Add a few ingredients, or use your pantry, and ChefAI will write a complete recipe with steps, timings and
      nutrition.
    </p>
  </div>
);

const RecipeGenerator = () => {
  const location = useLocation();
  // The dashboard can send items to cook with (e.g. ones expiring soon)
  const [ingredients, setIngredients] = useState(() => location.state?.ingredients || []);
  const [inputValue, setInputValue] = useState('');
  const [usePantry, setUsePantry] = useState(false);
  const [cuisineType, setCuisineType] = useState('any');
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [servings, setServings] = useState(4);
  const [cookingTime, setCookingTime] = useState('medium');
  const [allergies, setAllergies] = useState([]);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null); // { recipe, allergenWarnings }
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const resultRef = useRef(null);

  // Start from the user's saved preferences
  useEffect(() => {
    api
      .get('/users/profile')
      .then((res) => {
        const prefs = res.data.data.preferences;
        if (!prefs) return;
        setAllergies(prefs.allergies || []);
        if (prefs.dietary_restrictions?.length) setDietaryRestrictions(prefs.dietary_restrictions);
        if (prefs.preferred_cuisines?.length && prefs.preferred_cuisines[0] !== 'Any') setCuisineType(prefs.preferred_cuisines[0]);
        if (prefs.default_servings) setServings(prefs.default_servings);
      })
      .catch(() => {});
  }, []);

  const addIngredient = (value = inputValue) => {
    // Allow pasting "a, b, c"
    const parts = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setIngredients((prev) => {
      const lower = prev.map((p) => p.toLowerCase());
      return [...prev, ...parts.filter((p) => !lower.includes(p.toLowerCase()))];
    });
    setInputValue('');
  };

  const removeIngredient = (ingredient) => setIngredients((prev) => prev.filter((i) => i !== ingredient));

  const toggleDietary = (option) =>
    setDietaryRestrictions((prev) => (prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]));

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const pending = inputValue.trim() ? [inputValue.trim()] : [];
    const all = [...ingredients, ...pending];
    if (pending.length) addIngredient();

    if (!usePantry && all.length === 0) {
      toast.error('Add at least one ingredient, or use your pantry');
      return;
    }

    setGenerating(true);
    setResult(null);
    setSavedId(null);
    if (window.innerWidth < 1024) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }

    try {
      const res = await api.post('/recipes/generate', {
        ingredients: all,
        usePantryIngredients: usePantry,
        dietaryRestrictions,
        cuisineType,
        servings,
        cookingTime,
      });
      const { recipe, allergenWarnings = [] } = res.data.data;
      setResult({ recipe, allergenWarnings, key: Date.now() });
    } catch (error) {
      toast.error(errorMessage(error, 'Could not generate a recipe. Please try again.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const r = result.recipe;
    setSaving(true);
    try {
      const res = await api.post('/recipes', {
        name: r.name,
        description: r.description,
        cuisine_type: r.cuisineType,
        difficulty: r.difficulty,
        prep_time: r.prepTime,
        cook_time: r.cookTime,
        servings: r.servings,
        instructions: r.instructions,
        dietary_tags: r.dietaryTags || [],
        ingredients: r.ingredients,
        nutrition: r.nutrition,
      });
      setSavedId(res.data.data.recipe?.id || 'saved');
      toast.success('Saved to your recipes');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save the recipe'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="New recipe"
        description="Tell ChefAI what you have. It writes a recipe that fits your diet and leaves out your allergies."
      />

      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-10">
        {/* Brief */}
        <form onSubmit={handleGenerate} className="lg:sticky lg:top-8 lg:self-start" aria-label="Recipe brief">
          <Card className="divide-y divide-line">
            <div className="space-y-3 p-5">
              <Field label="Ingredients" hint="Press Enter after each one. You can paste a comma-separated list.">
                {(props) => (
                  <div className="flex gap-2">
                    <Input
                      {...props}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addIngredient();
                        }
                      }}
                      placeholder="e.g. chickpeas"
                      autoComplete="off"
                    />
                    <Button variant="secondary" icon={Plus} onClick={() => addIngredient()} aria-label="Add ingredient" className="px-3" />
                  </div>
                )}
              </Field>

              {ingredients.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5" aria-label="Added ingredients">
                  {ingredients.map((item) => (
                    <li key={item}>
                      <span className="inline-flex h-7 items-center gap-1 rounded-full bg-sunken pl-3 pr-1 text-[13px] text-ink">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeIngredient(item)}
                          aria-label={`Remove ${item}`}
                          className="flex size-5 items-center justify-center rounded-full text-muted hover:bg-line hover:text-ink"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted">Try:</span>
                  {SUGGESTED.slice(0, 5).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => addIngredient(item)}
                      className="h-7 rounded-full border border-dashed border-line-strong px-2.5 text-[13px] text-ink-2 hover:border-ink/40 hover:text-ink"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <Switch
                  checked={usePantry}
                  onChange={setUsePantry}
                  label="Use my pantry"
                  description="Include everything in your pantry as available ingredients."
                />
              </div>
            </div>

            <div className="space-y-4 p-5">
              <Field label="Cuisine">
                {(props) => (
                  <Select {...props} value={cuisineType} onChange={(e) => setCuisineType(e.target.value)}>
                    <option value="any">Any cuisine</option>
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <div className="space-y-1.5">
                <p className="text-[13px] font-medium text-ink-2" id="time-label">
                  Cooking time
                </p>
                <Segmented
                  value={cookingTime}
                  onChange={setCookingTime}
                  options={COOKING_TIMES.map((t) => ({ value: t.value, label: t.label }))}
                  label="Cooking time"
                  className="flex w-full"
                />
                <p className="text-xs text-muted">{COOKING_TIMES.find((t) => t.value === cookingTime)?.hint}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-[13px] font-medium text-ink-2">Servings</p>
                <Stepper value={servings} onChange={setServings} min={1} max={20} label="servings" />
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-medium text-ink-2">Diet</p>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((option) => (
                    <Chip key={option} selected={dietaryRestrictions.includes(option)} onClick={() => toggleDietary(option)}>
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 rounded-lg bg-sunken px-3 py-2.5 text-[13px]">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                {allergies.length > 0 ? (
                  <p className="text-ink-2">
                    Always avoiding <span className="font-medium text-ink">{allergies.join(', ')}</span>.{' '}
                    <Link to="/settings" className="font-medium text-brand hover:underline">
                      Edit
                    </Link>
                  </p>
                ) : (
                  <p className="text-ink-2">
                    No allergies saved.{' '}
                    <Link to="/settings" className="font-medium text-brand hover:underline">
                      Add them in Settings
                    </Link>{' '}
                    and ChefAI will leave them out.
                  </p>
                )}
              </div>
            </div>

            <div className="p-5">
              <Button type="submit" size="lg" icon={Sparkles} block loading={generating}>
                {generating ? 'Writing your recipe…' : 'Generate recipe'}
              </Button>
            </div>
          </Card>
        </form>

        {/* Result */}
        <section ref={resultRef} aria-label="Generated recipe" className="min-w-0 scroll-mt-20">
          {generating ? (
            <GeneratingState />
          ) : result ? (
            <RecipeView
              key={result.key}
              recipe={result.recipe}
              allergenWarnings={result.allergenWarnings}
              titleAs="h2"
              actions={
                savedId ? (
                  <ButtonLink to={savedId === 'saved' ? '/recipes' : `/recipes/${savedId}`} variant="secondary" icon={Check}>
                    Saved · Open
                  </ButtonLink>
                ) : (
                  <>
                    <Button variant="secondary" icon={RotateCcw} onClick={handleGenerate}>
                      Try another
                    </Button>
                    <Button icon={Bookmark} onClick={handleSave} loading={saving}>
                      Save recipe
                    </Button>
                  </>
                )
              }
            />
          ) : (
            <EmptyResult />
          )}
        </section>
      </div>
    </>
  );
};

export default RecipeGenerator;
