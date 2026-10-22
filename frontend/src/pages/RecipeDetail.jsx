import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useConfirm } from '../components/ConfirmDialog';
import AddToPlanModal from '../components/AddToPlanModal';
import RecipeView from '../components/RecipeView';
import { Button, IconButton, PageLoader } from '../components/ui';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/recipes/${id}`)
      .then((res) => !cancelled && setRecipe(res.data.data.recipe))
      .catch(() => {
        if (cancelled) return;
        toast.error('Recipe not found');
        navigate('/recipes', { replace: true });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete this recipe?',
      description: `“${recipe.name}” will be removed from your recipes and meal plan.`,
      confirmLabel: 'Delete recipe',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success('Recipe deleted');
      navigate('/recipes');
    } catch {
      toast.error('Could not delete the recipe');
    }
  };

  if (loading || !recipe) return <PageLoader label="Loading recipe" />;

  return (
    <>
      <Link
        to="/recipes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Recipes
      </Link>

      <RecipeView
        key={recipe.id}
        recipe={recipe}
        actions={
          <>
            <Button variant="secondary" icon={CalendarPlus} onClick={() => setPlanOpen(true)}>
              Add to plan
            </Button>
            <IconButton icon={Trash2} label="Delete recipe" variant="danger" onClick={handleDelete} />
          </>
        }
      />

      <AddToPlanModal open={planOpen} onClose={() => setPlanOpen(false)} recipe={recipe} />
    </>
  );
};

export default RecipeDetail;
