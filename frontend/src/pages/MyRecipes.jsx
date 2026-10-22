import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Flame, Search, Sparkles, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { DIFFICULTIES } from '../lib/constants';
import { formatMinutes } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { Badge, ButtonLink, Card, EmptyState, IconButton, Input, PageHeader, Select, Skeleton } from '../components/ui';

const RecipeCard = ({ recipe, onDelete }) => {
  const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  return (
    <Card as="li" className="group relative flex flex-col transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_4px_16px_-6px_rgb(31_26_21/0.12)]">
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 flex items-center gap-2 text-xs text-muted">
          {recipe.cuisine_type && <span>{recipe.cuisine_type}</span>}
          {recipe.cuisine_type && recipe.difficulty && <span aria-hidden="true">·</span>}
          {recipe.difficulty && <span className="capitalize">{recipe.difficulty}</span>}
        </p>
        <h2 className="display text-[21px] leading-snug">
          {/* The whole card is clickable through this link */}
          <Link to={`/recipes/${recipe.id}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] focus-visible:outline-none">
            {recipe.name}
          </Link>
        </h2>
        {recipe.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{recipe.description}</p>}
        {recipe.dietary_tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.dietary_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} tone="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px] text-muted">
        <div className="tabular flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {formatMinutes(total)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden="true" />
            {recipe.servings || '—'}
          </span>
          {recipe.calories && (
            <span className="flex items-center gap-1.5">
              <Flame className="size-3.5" aria-hidden="true" />
              {recipe.calories} kcal
            </span>
          )}
        </div>
        {/* Above the card link so it stays clickable */}
        <IconButton
          icon={Trash2}
          label={`Delete ${recipe.name}`}
          variant="danger"
          size="sm"
          onClick={() => onDelete(recipe)}
          className="relative z-10 -my-1 -mr-2 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
        />
      </div>
    </Card>
  );
};

const MyRecipes = () => {
  const confirm = useConfirm();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    api
      .get('/recipes')
      .then((res) => setRecipes(res.data.data.recipes || []))
      .catch(() => toast.error('Could not load your recipes'))
      .finally(() => setLoading(false));
  }, []);

  // Cuisine filter options come from the recipes the user actually has
  const cuisines = useMemo(
    () => [...new Set(recipes.map((r) => r.cuisine_type).filter(Boolean))].sort(),
    [recipes],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = recipes.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) &&
        (cuisine === 'all' || r.cuisine_type === cuisine) &&
        (difficulty === 'all' || r.difficulty === difficulty),
    );
    const time = (r) => (r.prep_time || 0) + (r.cook_time || 0);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'quickest') list.sort((a, b) => time(a) - time(b));
    return list;
  }, [recipes, search, cuisine, difficulty, sort]);

  const handleDelete = async (recipe) => {
    const ok = await confirm({
      title: 'Delete this recipe?',
      description: `“${recipe.name}” will be removed from your recipes and meal plan.`,
      confirmLabel: 'Delete recipe',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/recipes/${recipe.id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      toast.success('Recipe deleted');
    } catch {
      toast.error('Could not delete the recipe');
    }
  };

  const filtersActive = search || cuisine !== 'all' || difficulty !== 'all';

  return (
    <>
      <PageHeader
        title="Recipes"
        description={loading ? 'Your saved recipes' : `${recipes.length} saved ${recipes.length === 1 ? 'recipe' : 'recipes'}`}
        actions={
          <ButtonLink to="/generate" icon={Sparkles}>
            New recipe
          </ButtonLink>
        }
      />

      {recipes.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              icon={Search}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes"
              aria-label="Search recipes"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Select value={cuisine} onChange={(e) => setCuisine(e.target.value)} aria-label="Cuisine" className="sm:w-40">
              <option value="all">All cuisines</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty" className="sm:w-36">
              <option value="all">Any level</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by" className="sm:w-36">
              <option value="newest">Newest</option>
              <option value="name">A–Z</option>
              <option value="quickest">Quickest</option>
            </Select>
          </div>
        </div>
      )}

      {loading ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card as="li" key={i} className="space-y-3 p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </ul>
      ) : recipes.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No recipes yet"
            description="Generate a recipe from what’s in your kitchen and save the ones you like here."
            action={
              <ButtonLink to="/generate" icon={Sparkles}>
                Create your first recipe
              </ButtonLink>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No matching recipes"
            description="Try a different search or clear the filters."
            action={
              filtersActive && (
                <button
                  type="button"
                  className="text-sm font-medium text-brand hover:underline"
                  onClick={() => {
                    setSearch('');
                    setCuisine('all');
                    setDifficulty('all');
                  }}
                >
                  Clear filters
                </button>
              )
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </>
  );
};

export default MyRecipes;
