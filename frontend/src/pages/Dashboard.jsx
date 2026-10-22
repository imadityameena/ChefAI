import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow } from 'date-fns';
import { ArrowRight, CalendarDays, Clock, Leaf, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { expiryStatus, firstName, formatMinutes, greeting, toLocalDate } from '../lib/format';
import { MEAL_TYPES } from '../lib/constants';
import { Badge, ButtonLink, Card, CardHeader, EmptyState, Skeleton } from '../components/ui';

const dayLabel = (value) => {
  const d = toLocalDate(value);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEEE');
};

const Stat = ({ label, value, to, note, noteTone }) => (
  <Link to={to} className="group block px-5 py-4 transition-colors hover:bg-paper/60 sm:px-6 sm:py-5">
    <p className="text-[13px] text-muted">{label}</p>
    <p className="display tabular mt-1 text-[32px] leading-none text-ink">{value}</p>
    <p className={`mt-2 min-h-4 text-xs ${noteTone === 'amber' ? 'font-medium text-amber' : 'text-muted'}`}>{note}</p>
  </Link>
);

const ViewAll = ({ to, children }) => (
  <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-brand">
    {children} <ArrowRight className="size-3.5" aria-hidden="true" />
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/recipes/stats'),
      api.get('/pantry/stats'),
      api.get('/meal-plans/stats'),
      api.get('/recipes/recent?limit=4'),
      api.get('/meal-plans/upcoming?limit=6'),
      api.get('/pantry/expiring-soon?days=7'),
    ])
      .then(([recipeStats, pantryStats, planStats, recent, upcoming, expiring]) =>
        setData({
          recipes: Number(recipeStats.data.data.stats.total_recipes) || 0,
          pantry: Number(pantryStats.data.data.stats.total_items) || 0,
          expiringCount: Number(pantryStats.data.data.stats.expiring_soon_count) || 0,
          lowCount: Number(pantryStats.data.data.stats.running_low_count) || 0,
          planned: Number(planStats.data.data.stats.this_week_count) || 0,
          recent: recent.data.data.recipes || [],
          upcoming: upcoming.data.data.meals || [],
          expiring: expiring.data.data.items || [],
        }),
      )
      .catch(() => setData({ error: true, recipes: 0, pantry: 0, planned: 0, recent: [], upcoming: [], expiring: [] }));
  }, []);

  const loading = !data;

  // Group upcoming meals by day
  const upcomingByDay = [];
  for (const meal of data?.upcoming || []) {
    const key = String(meal.meal_date).slice(0, 10);
    const last = upcomingByDay[upcomingByDay.length - 1];
    if (last && last.key === key) last.meals.push(meal);
    else upcomingByDay.push({ key, meals: [meal] });
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-muted">{format(new Date(), 'EEEE, d MMMM')}</p>
          <h1 className="display text-[30px] leading-tight sm:text-[34px]">
            {greeting()}
            {firstName(user?.name) && `, ${firstName(user.name)}`}
          </h1>
        </div>
      </header>

      {/* At a glance */}
      <Card className="mb-8 grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 px-6 py-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))
        ) : (
          <>
            <Stat label="Saved recipes" value={data.recipes} to="/recipes" note={data.recipes ? 'View all' : 'Create your first'} />
            <Stat
              label="In your pantry"
              value={data.pantry}
              to="/pantry"
              note={
                data.expiringCount
                  ? `${data.expiringCount} expiring this week`
                  : data.lowCount
                    ? `${data.lowCount} running low`
                    : 'Nothing expiring soon'
              }
              noteTone={data.expiringCount ? 'amber' : undefined}
            />
            <Stat label="Meals planned" value={data.planned} to="/meal-plan" note="Next 7 days" />
          </>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Coming up */}
          <Card>
            <CardHeader title="Coming up" action={<ViewAll to="/meal-plan">Meal plan</ViewAll>} />
            {loading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : upcomingByDay.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing planned yet"
                description="Plan a few meals and your week shows up here."
                action={
                  <ButtonLink to="/meal-plan" variant="secondary" size="sm">
                    Plan meals
                  </ButtonLink>
                }
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-line">
                {upcomingByDay.map(({ key, meals }) => (
                  <li key={key} className="grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{dayLabel(key)}</p>
                      <p className="text-xs text-muted">{format(toLocalDate(key), 'd MMM')}</p>
                    </div>
                    <ul className="space-y-2">
                      {meals.map((meal) => (
                        <li key={meal.id} className="flex items-baseline gap-3">
                          <span className="w-16 shrink-0 text-xs text-muted">
                            {MEAL_TYPES.find((m) => m.value === meal.meal_type)?.label}
                          </span>
                          <Link to={`/recipes/${meal.recipe_id}`} className="min-w-0 truncate text-[15px] text-ink hover:text-brand">
                            {meal.recipe_name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recent recipes */}
          <Card>
            <CardHeader title="Recently saved" action={<ViewAll to="/recipes">All recipes</ViewAll>} />
            {loading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : data.recent.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No recipes yet"
                description="Tell ChefAI what’s in your kitchen and it will write you a recipe."
                action={
                  <ButtonLink to="/generate" size="sm">
                    Create a recipe
                  </ButtonLink>
                }
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-line">
                {data.recent.map((recipe) => (
                  <li key={recipe.id}>
                    <Link to={`/recipes/${recipe.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-paper/60">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium text-ink">{recipe.name}</span>
                        <span className="block text-xs text-muted first-letter:uppercase">
                          {[recipe.cuisine_type, recipe.difficulty].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="tabular flex shrink-0 items-center gap-1.5 text-[13px] text-muted">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {formatMinutes((recipe.prep_time || 0) + (recipe.cook_time || 0))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Use soon */}
        <Card className="self-start">
          <CardHeader title="Use soon" description="Expiring in the next 7 days" action={<ViewAll to="/pantry">Pantry</ViewAll>} />
          {loading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : data.expiring.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted">
              <Leaf className="size-4 text-herb" aria-hidden="true" />
              Nothing is about to expire.
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {data.expiring.map((item) => {
                  const status = expiryStatus(item.expiry_date);
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <span className="min-w-0 truncate text-[15px] text-ink">{item.name}</span>
                      <Badge tone={status?.tone === 'neutral' ? 'neutral' : status?.tone}>
                        {status?.days === 0 ? 'Today' : status?.days === 1 ? 'Tomorrow' : `${status?.days} days`}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-line p-4">
                <ButtonLink
                  to="/generate"
                  state={{ ingredients: data.expiring.map((i) => i.name) }}
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  block
                >
                  Cook something with these
                </ButtonLink>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
