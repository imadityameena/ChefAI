import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, format, isSameMonth, isToday, parseISO, startOfWeek } from 'date-fns';
import { BookOpen, ChevronLeft, ChevronRight, Clock, Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { MEAL_TYPES } from '../lib/constants';
import { errorMessage, formatMinutes } from '../lib/format';
import { Button, ButtonLink, EmptyState, IconButton, Input, Modal, PageHeader, cx } from '../components/ui';

const WEEK_OPTIONS = { weekStartsOn: 1 };

const weekLabel = (start) => {
  const end = addDays(start, 6);
  return isSameMonth(start, end)
    ? `${format(start, 'd')} – ${format(end, 'd MMMM yyyy')}`
    : `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
};

const PickRecipeModal = ({ slot, recipes, onClose, onAdded }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slot) {
      setQuery('');
      setSelected(null);
    }
  }, [slot]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? recipes.filter((r) => r.name.toLowerCase().includes(q)) : recipes;
  }, [recipes, query]);

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.post('/meal-plans', { recipe_id: selected, planned_date: slot.date, meal_type: slot.mealType });
      onAdded();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not add the meal'));
    } finally {
      setSaving(false);
    }
  };

  const mealLabel = MEAL_TYPES.find((m) => m.value === slot?.mealType)?.label;

  return (
    <Modal
      open={Boolean(slot)}
      onClose={onClose}
      title={`Add ${mealLabel?.toLowerCase() || 'meal'}`}
      description={slot ? format(parseISO(slot.date), 'EEEE d MMMM') : ''}
      footer={
        recipes.length > 0 && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selected} loading={saving}>
              Add to plan
            </Button>
          </>
        )
      }
    >
      {recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No saved recipes"
          description="Save a recipe first, then plan it here."
          action={
            <ButtonLink to="/generate" size="sm">
              Create a recipe
            </ButtonLink>
          }
          className="py-6"
        />
      ) : (
        <div className="space-y-3">
          <Input icon={Search} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes" aria-label="Search recipes" data-autofocus />
          <div role="radiogroup" aria-label="Recipe" className="max-h-72 space-y-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No recipes match “{query}”.</p>
            ) : (
              filtered.map((r) => {
                const active = selected === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(r.id)}
                    onDoubleClick={handleAdd}
                    className={cx(
                      'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      active ? 'border-brand bg-brand-soft' : 'border-transparent hover:bg-sunken',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{r.name}</span>
                      <span className="block text-xs text-muted">
                        {[r.cuisine_type, formatMinutes((r.prep_time || 0) + (r.cook_time || 0))].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span
                      className={cx(
                        'size-4 shrink-0 rounded-full border',
                        active ? 'border-[5px] border-brand' : 'border-line-strong',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

const Slot = ({ meal, mealType, onAdd, onRemove }) => {
  const label = MEAL_TYPES.find((m) => m.value === mealType)?.label;
  if (meal) {
    return (
      <div className="group relative min-h-[62px] rounded-lg border border-line bg-surface p-2.5 transition-colors hover:border-line-strong">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
        <Link to={`/recipes/${meal.recipe_id}`} className="mt-0.5 block pr-5 text-[13px] font-medium leading-snug text-ink hover:text-brand">
          {meal.recipe_name}
        </Link>
        {(meal.prep_time || meal.cook_time) && (
          <p className="tabular mt-1 flex items-center gap-1 text-[11px] text-muted">
            <Clock className="size-3" aria-hidden="true" />
            {formatMinutes((meal.prep_time || 0) + (meal.cook_time || 0))}
          </p>
        )}
        <button
          type="button"
          onClick={() => onRemove(meal)}
          aria-label={`Remove ${meal.recipe_name} from ${label}`}
          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-md text-muted hover:bg-danger-soft hover:text-danger lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${label}`}
      className={cx(
        // Quiet until hovered, so an empty week doesn't look busy
        'flex h-[62px] w-full items-center gap-1.5 rounded-lg border border-dashed border-transparent px-2.5 text-left text-[13px] text-muted/80 transition-colors hover:border-brand/40 hover:bg-brand-soft/50 hover:text-brand focus-visible:border-brand/40',
      )}
    >
      <Plus className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

const MealPlanner = () => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), WEEK_OPTIONS));
  const [meals, setMeals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState(null);

  const startKey = format(weekStart, 'yyyy-MM-dd');

  const fetchWeek = useCallback(
    () =>
      api
        .get(`/meal-plans/weekly?start_date=${startKey}`)
        .then((res) => setMeals(res.data.data.mealPlans || []))
        .catch(() => toast.error('Could not load the meal plan'))
        .finally(() => setLoading(false)),
    [startKey],
  );

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  useEffect(() => {
    api
      .get('/recipes')
      .then((res) => setRecipes(res.data.data.recipes || []))
      .catch(() => {});
  }, []);

  const byDay = useMemo(() => {
    const map = {};
    for (const m of meals) {
      const key = String(m.meal_date).slice(0, 10);
      map[key] = { ...(map[key] || {}), [m.meal_type]: m };
    }
    return map;
  }, [meals]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const isCurrentWeek = startKey === format(startOfWeek(new Date(), WEEK_OPTIONS), 'yyyy-MM-dd');

  const removeMeal = async (meal) => {
    setMeals((prev) => prev.filter((m) => m.id !== meal.id));
    try {
      await api.delete(`/meal-plans/${meal.id}`);
    } catch {
      toast.error('Could not remove the meal');
      fetchWeek();
    }
  };

  return (
    <>
      <PageHeader
        title="Meal plan"
        description={`${meals.length} ${meals.length === 1 ? 'meal' : 'meals'} planned this week`}
        actions={
          <div className="flex items-center gap-1">
            <IconButton icon={ChevronLeft} label="Previous week" variant="secondary" onClick={() => setWeekStart((w) => addDays(w, -7))} />
            <Button variant="secondary" onClick={() => setWeekStart(startOfWeek(new Date(), WEEK_OPTIONS))} disabled={isCurrentWeek}>
              This week
            </Button>
            <IconButton icon={ChevronRight} label="Next week" variant="secondary" onClick={() => setWeekStart((w) => addDays(w, 7))} />
          </div>
        }
      />

      <h2 className="mb-4 text-sm font-medium text-ink-2" aria-live="polite">
        {weekLabel(weekStart)}
      </h2>

      <div className={cx('grid gap-3 transition-opacity lg:grid-cols-7 lg:gap-2', loading && 'opacity-50')}>
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const today = isToday(day);
          const dayMeals = byDay[key] || {};
          return (
            <section
              key={key}
              aria-label={format(day, 'EEEE d MMMM')}
              className={cx(
                'rounded-xl border p-3 lg:p-2',
                today ? 'border-brand/40 bg-brand-soft/40' : 'border-line bg-paper',
              )}
            >
              <header className="mb-2.5 flex items-baseline justify-between px-0.5 lg:block">
                <p className={cx('text-xs font-medium', today ? 'text-brand' : 'text-muted')}>
                  {format(day, 'EEE')}
                  {today && <span className="lg:hidden"> · Today</span>}
                </p>
                <p className={cx('display text-[20px] leading-tight lg:text-[22px]', today ? 'text-brand' : 'text-ink')}>
                  {format(day, 'd')}
                </p>
              </header>
              {/* Desktop: fixed breakfast / lunch / dinner rows so days line up */}
              <div className="hidden gap-1.5 lg:grid">
                {MEAL_TYPES.map(({ value }) => (
                  <Slot
                    key={value}
                    meal={dayMeals[value]}
                    mealType={value}
                    onAdd={() => setSlot({ date: key, mealType: value })}
                    onRemove={removeMeal}
                  />
                ))}
              </div>

              {/* Mobile: planned meals, then one compact row of "add" buttons */}
              <div className="space-y-1.5 lg:hidden">
                {MEAL_TYPES.filter(({ value }) => dayMeals[value]).map(({ value }) => (
                  <Slot key={value} meal={dayMeals[value]} mealType={value} onRemove={removeMeal} />
                ))}
                <div className="flex flex-wrap gap-1.5">
                  {MEAL_TYPES.filter(({ value }) => !dayMeals[value]).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSlot({ date: key, mealType: value })}
                      aria-label={`Add ${label} on ${format(day, 'EEEE')}`}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-[13px] text-muted hover:border-brand/50 hover:text-brand"
                    >
                      <Plus className="size-3.5" aria-hidden="true" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <PickRecipeModal slot={slot} recipes={recipes} onClose={() => setSlot(null)} onAdded={fetchWeek} />
    </>
  );
};

export default MealPlanner;
