/* The full recipe layout (header, ingredients, method, nutrition).
   Used by the saved recipe page and the AI generator result, so both look
   the same. Accepts API (snake_case) or AI (camelCase) recipe shapes. */
import { useState } from 'react';
import { Clock, Lightbulb, ShieldAlert, Users } from 'lucide-react';
import { Badge, Stepper, cx } from './ui';
import { formatMinutes, formatQuantity } from '../lib/format';

// eslint-disable-next-line react-refresh/only-export-components
export const normalizeRecipe = (r = {}) => ({
  name: r.name || 'Untitled recipe',
  description: r.description || '',
  cuisine: r.cuisine_type ?? r.cuisineType ?? '',
  difficulty: r.difficulty || '',
  prepTime: Number(r.prep_time ?? r.prepTime) || 0,
  cookTime: Number(r.cook_time ?? r.cookTime) || 0,
  servings: Number(r.servings) || 4,
  tags: r.dietary_tags ?? r.dietaryTags ?? [],
  ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
  instructions: Array.isArray(r.instructions) ? r.instructions : [],
  nutrition: r.nutrition && Object.values(r.nutrition).some((v) => v !== null && v !== undefined) ? r.nutrition : null,
  notes: r.user_notes || '',
  tips: r.cookingTips ?? r.cooking_tips ?? [],
});

const DIFFICULTY_TONE = { easy: 'herb', medium: 'amber', hard: 'danger' };

export const RecipeMeta = ({ recipe, servings }) => {
  const total = recipe.prepTime + recipe.cookTime;
  return (
    <dl className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface">
      <div className="px-4 py-3">
        <dt className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="size-3.5" aria-hidden="true" /> Total time
        </dt>
        <dd className="tabular mt-0.5 text-[15px] font-semibold text-ink">{formatMinutes(total)}</dd>
      </div>
      <div className="px-4 py-3">
        <dt className="text-xs text-muted">Prep · Cook</dt>
        <dd className="tabular mt-0.5 text-[15px] font-semibold text-ink">
          {recipe.prepTime || '—'} · {recipe.cookTime || '—'} <span className="text-xs font-normal text-muted">min</span>
        </dd>
      </div>
      <div className="px-4 py-3">
        <dt className="flex items-center gap-1.5 text-xs text-muted">
          <Users className="size-3.5" aria-hidden="true" /> Serves
        </dt>
        <dd className="tabular mt-0.5 text-[15px] font-semibold text-ink">{servings}</dd>
      </div>
    </dl>
  );
};

const RecipeView = ({ recipe: raw, actions, allergenWarnings = [], titleAs: Title = 'h1' }) => {
  const recipe = normalizeRecipe(raw);
  const [servings, setServings] = useState(recipe.servings);
  const [checked, setChecked] = useState(() => new Set());

  const scale = servings / recipe.servings;
  const scaled = (qty) => {
    if (qty === null || qty === undefined || qty === '') return '';
    return formatQuantity(Number(qty) * scale);
  };

  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const eyebrow = [recipe.cuisine, recipe.difficulty && `${recipe.difficulty[0].toUpperCase()}${recipe.difficulty.slice(1)}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="@container">
      {allergenWarnings.length > 0 && (
        <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Check this recipe against your allergies</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {allergenWarnings.map(({ ingredient, allergy }) => (
                <li key={`${ingredient}-${allergy}`}>
                  “{ingredient}” may contain {allergy}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-danger/80">ChefAI was told to avoid it, but always check labels yourself.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow && <p className="mb-2 text-[13px] font-medium text-muted">{eyebrow}</p>}
            <Title className="display text-[32px] leading-[1.1] sm:text-[40px]">{recipe.name}</Title>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
        {recipe.description && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-2">{recipe.description}</p>}

        {(recipe.tags.length > 0 || recipe.difficulty) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {recipe.difficulty && (
              <Badge tone={DIFFICULTY_TONE[recipe.difficulty] || 'neutral'} className="capitalize">
                {recipe.difficulty}
              </Badge>
            )}
            {recipe.tags.map((tag) => (
              <Badge key={tag} tone="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-6 max-w-xl">
          <RecipeMeta recipe={recipe} servings={servings} />
        </div>
      </header>

      <div className="grid gap-8 @3xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] @3xl:gap-12">
        {/* Ingredients */}
        <section aria-labelledby="ingredients-heading" className="@3xl:sticky @3xl:top-8 @3xl:self-start">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="ingredients-heading" className="text-[17px] font-semibold">
              Ingredients
            </h2>
            <div className="flex items-center gap-2">
              <Stepper value={servings} onChange={setServings} label="servings" />
            </div>
          </div>
          {servings !== recipe.servings && (
            <p className="-mt-2 mb-3 text-xs text-muted">
              Scaled from {recipe.servings} to {servings} servings ·{' '}
              <button type="button" onClick={() => setServings(recipe.servings)} className="font-medium text-brand hover:underline">
                Reset
              </button>
            </p>
          )}

          {recipe.ingredients.length === 0 ? (
            <p className="text-sm text-muted">No ingredients listed.</p>
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {recipe.ingredients.map((ing, i) => {
                const done = checked.has(i);
                const qty = scaled(ing.quantity);
                return (
                  <li key={`${ing.name}-${i}`}>
                    <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-paper/60">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(i)}
                        className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[var(--color-brand)]"
                      />
                      <span className={cx('flex-1 text-[15px] leading-snug', done ? 'text-muted line-through' : 'text-ink')}>
                        {ing.name}
                      </span>
                      <span className={cx('tabular shrink-0 text-right text-sm', done ? 'text-muted' : 'text-ink-2')}>
                        {qty} {ing.unit}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Method, nutrition, notes */}
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="method-heading">
            <h2 id="method-heading" className="mb-4 text-[17px] font-semibold">
              Method
            </h2>
            {recipe.instructions.length === 0 ? (
              <p className="text-sm text-muted">No steps listed.</p>
            ) : (
              <ol className="space-y-6">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-3">
                    <span className="display pt-0.5 text-[22px] leading-none text-brand" aria-hidden="true">
                      {i + 1}
                    </span>
                    <p className="text-[16px] leading-relaxed text-ink-2">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {recipe.tips.length > 0 && (
            <section aria-labelledby="tips-heading" className="rounded-xl bg-sunken p-5">
              <h2 id="tips-heading" className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="size-4 text-amber" aria-hidden="true" /> Chef’s tips
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-ink-2">
                {recipe.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipe.nutrition && (
            <section aria-labelledby="nutrition-heading">
              <h2 id="nutrition-heading" className="mb-1 text-[17px] font-semibold">
                Nutrition
              </h2>
              <p className="mb-4 text-[13px] text-muted">Per serving, estimated</p>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line @xl:grid-cols-5">
                {[
                  ['Calories', recipe.nutrition.calories, 'kcal'],
                  ['Protein', recipe.nutrition.protein, 'g'],
                  ['Carbs', recipe.nutrition.carbs, 'g'],
                  ['Fat', recipe.nutrition.fats, 'g'],
                  ['Fibre', recipe.nutrition.fiber, 'g'],
                ].map(([label, value, unit], i) => (
                  // Calories gets its own row on narrow screens so the grid has no gaps
                  <div key={label} className={cx('bg-surface px-4 py-3', i === 0 && 'col-span-2 @xl:col-span-1')}>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="tabular mt-0.5 text-[17px] font-semibold text-ink">
                      {value === null || value === undefined ? '—' : formatQuantity(value)}
                      {value !== null && value !== undefined && <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {recipe.notes && (
            <section aria-labelledby="notes-heading" className="border-l-2 border-brand/40 pl-4">
              <h2 id="notes-heading" className="mb-1 text-sm font-semibold">
                Your notes
              </h2>
              <p className="text-[15px] leading-relaxed text-ink-2">{recipe.notes}</p>
            </section>
          )}
        </div>
      </div>
    </article>
  );
};

export default RecipeView;
