import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Trash2 } from 'lucide-react';

import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

// Show "1.5" instead of "1.50", and "2" instead of "2.00"
const formatQuantity = (qty) => {
    if (qty === null || qty === undefined || qty === '') return '';
    const num = Number(qty);
    if (Number.isNaN(num)) return String(qty);
    return String(Math.round(num * 100) / 100);
};

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await api.get(`/recipes/${id}`);
                const recipeData = response.data.data.recipe;

                setRecipe(recipeData);
                setServings(recipeData.servings || 4);
                setCheckedIngredients(new Set());
            } catch {
                toast.error('Failed to load recipe');
                navigate('/recipes');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await api.delete(`/recipes/${id}`);
            toast.success('Recipe deleted');
            navigate('/recipes');
        } catch {
            toast.error('Failed to delete recipe');
        }
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;
    const ingredients = recipe.ingredients || [];
    const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

    const adjustQuantity = (originalQty) => {
        if (originalQty === null || originalQty === undefined) return null;
        return formatQuantity((Number(originalQty) * servings) / originalServings);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to="/recipes"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Recipes
                </Link>

                {/* Recipe Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
                            {recipe.description && (
                                <p className="text-gray-600 text-lg">{recipe.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDelete}
                            aria-label="Delete recipe"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {recipe.cuisine_type}
                            </span>
                        )}
                        {recipe.difficulty && (
                            <span
                                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                                    recipe.difficulty === 'easy'
                                        ? 'bg-green-100 text-green-700'
                                        : recipe.difficulty === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {recipe.difficulty}
                            </span>
                        )}
                        {recipe.dietary_tags?.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">{totalTime} minutes</span>
                        </div>
                        {recipe.prep_time > 0 && <div className="text-sm">Prep: {recipe.prep_time} min</div>}
                        {recipe.cook_time > 0 && <div className="text-sm">Cook: {recipe.cook_time} min</div>}
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>{servings} servings</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ingredients */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Servings</span>
                                </div>
                            </div>

                            {/* Servings adjuster */}
                            <div className="mb-6 flex items-center gap-3">
                                <button
                                    onClick={() => setServings(Math.max(1, servings - 1))}
                                    aria-label="Fewer servings"
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    −
                                </button>
                                <span className="text-lg font-semibold text-gray-900 w-12 text-center">{servings}</span>
                                <button
                                    onClick={() => setServings(servings + 1)}
                                    aria-label="More servings"
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    +
                                </button>
                                {servings !== originalServings && (
                                    <button
                                        onClick={() => setServings(originalServings)}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {ingredients.length === 0 ? (
                                <p className="text-sm text-gray-500">No ingredients listed.</p>
                            ) : (
                                <div className="space-y-3">
                                    {ingredients.map((ingredient, index) => {
                                        const qty = adjustQuantity(ingredient.quantity);
                                        const isChecked = checkedIngredients.has(index);

                                        return (
                                            <label key={index} className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleIngredient(index)}
                                                    className="mt-1 w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                                <span className={`flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                    {qty && <span className="font-medium">{qty}</span>} {ingredient.unit} {ingredient.name}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions, nutrition, notes */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                            {instructions.length === 0 ? (
                                <p className="text-sm text-gray-500">No instructions listed.</p>
                            ) : (
                                <ol className="space-y-4">
                                    {instructions.map((step, index) => (
                                        <li key={index} className="flex gap-4">
                                            <span className="shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                            <p className="text-gray-700 pt-1 flex-1">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>

                        {recipe.nutrition && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutrition (per serving)</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fats} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber} unit="g" />
                                </div>
                            </div>
                        )}

                        {recipe.user_notes && (
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                                <h3 className="font-semibold text-emerald-900 mb-2">Notes</h3>
                                <p className="text-emerald-800">{recipe.user_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionCard = ({ label, value, unit }) => (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-gray-900">
            {value === null || value === undefined ? '–' : `${formatQuantity(value)}${unit}`}
        </div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
);

export default RecipeDetail;
