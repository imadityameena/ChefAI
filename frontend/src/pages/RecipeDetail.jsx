import { useState, useEffect } from 'react';
import {
    useParams,
    useNavigate,
    Link
} from 'react-router-dom';

import {
    Clock,
    Users,
    ArrowLeft,
    Trash2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recipe, setRecipe] =
        useState(null);

    const [servings, setServings] =
        useState(4);

    const [
        checkedIngredients,
        setCheckedIngredients
    ] = useState(new Set());

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe =
        async () => {
            try {
                const response =
                    await api.get(
                        `/recipes/${id}`
                    );

                const recipeData =
                    response.data.data
                        .recipe;

                setRecipe(
                    recipeData
                );

                setServings(
                    recipeData.servings ||
                        4
                );
            } catch (error) {
                toast.error(
                    'Failed to load recipe'
                );

                navigate(
                    '/recipes'
                );
            } finally {
                setLoading(
                    false
                );
            }
        };

    const handleDelete =
        async () => {
            if (
                !confirm(
                    'Are you sure you want to delete this recipe?'
                )
            )
                return;

            try {
                await api.delete(
                    `/recipes/${id}`
                );

                toast.success(
                    'Recipe deleted'
                );

                navigate(
                    '/recipes'
                );
            } catch (error) {
                toast.error(
                    'Failed to delete recipe'
                );
            }
        };

    const toggleIngredient = (
        index
    ) => {
        const newChecked =
            new Set(
                checkedIngredients
            );

        if (
            newChecked.has(
                index
            )
        ) {
            newChecked.delete(
                index
            );
        } else {
            newChecked.add(
                index
            );
        }

        setCheckedIngredients(
            newChecked
        );
    };

    const adjustQuantity = (
        originalQty,
        originalServings
    ) => {
        return (
            (originalQty *
                servings) /
            originalServings
        ).toFixed(2);
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

    const totalTime =
        (recipe.prep_time ||
            0) +
        (recipe.cook_time ||
            0);

    const originalServings =
        recipe.servings || 4;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
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
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {
                                    recipe.name
                                }
                            </h1>

                            {recipe.description && (
                                <p className="text-gray-600 text-lg">
                                    {
                                        recipe.description
                                    }
                                </p>
                            )}
                        </div>

                        <button
                            onClick={
                                handleDelete
                            }
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {
                                    recipe.cuisine_type
                                }
                            </span>
                        )}

                        {recipe.difficulty && (
                            <span
                                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                                    recipe.difficulty ===
                                    'easy'
                                        ? 'bg-green-100 text-green-700'
                                        : recipe.difficulty ===
                                          'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {
                                    recipe.difficulty
                                }
                            </span>
                        )}

                        {recipe.dietary_tags &&
                            recipe.dietary_tags.map(
                                (
                                    tag
                                ) => (
                                    <span
                                        key={
                                            tag
                                        }
                                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                    >
                                        {
                                            tag
                                        }
                                    </span>
                                )
                            )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />

                            <span className="font-medium">
                                {
                                    totalTime
                                }{' '}
                                minutes
                            </span>
                        </div>

                        {recipe.prep_time && (
                            <div className="text-sm">
                                Prep:{' '}
                                {
                                    recipe.prep_time
                                }{' '}
                                min
                            </div>
                        )}

                        {recipe.cook_time && (
                            <div className="text-sm">
                                Cook:{' '}
                                {
                                    recipe.cook_time
                                }{' '}
                                min
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />

                            <span>
                                {
                                    servings
                                }{' '}
                                servings
                            </span>
                        </div>
                    </div>
                </div>

                {/* Keep your remaining UI same */}
            </div>
        </div>
    );
};

const NutritionCard = ({
    label,
    value,
    unit
}) => (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-gray-900">
            {value}
            {unit}
        </div>

        <div className="text-sm text-gray-600 mt-1">
            {label}
        </div>
    </div>
);

export default RecipeDetail;