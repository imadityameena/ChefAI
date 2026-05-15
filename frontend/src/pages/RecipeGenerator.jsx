import { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES = [
    'Any',
    'Italian',
    'Mexican',
    'Indian',
    'Chinese',
    'Japanese',
    'Thai',
    'French',
    'Mediterranean',
    'American'
];

const DIETARY_OPTIONS = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo'
];

const COOKING_TIMES = [
    { value: 'quick', label: 'Quick (<30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (>60 min)' }
];

const RecipeGenerator = () => {
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [usePantry, setUsePantry] = useState(false);
    const [cuisineType, setCuisineType] = useState('Any');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [servings, setServings] = useState(4);
    const [cookingTime, setCookingTime] = useState('medium');
    const [generating, setGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [saving, setSaving] = useState(false);
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);

    // Load user preferences on component mount
    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const response = await api.get('/users/profile');
                const preferences =
                    response.data.data.preferences;

                if (preferences) {
                    // Auto-fill dietary restrictions
                    if (
                        preferences.dietary_restrictions &&
                        preferences.dietary_restrictions.length > 0
                    ) {
                        setDietaryRestrictions(
                            preferences.dietary_restrictions
                        );
                    }

                    // Auto-fill preferred cuisine
                    if (
                        preferences.preferred_cuisines &&
                        preferences.preferred_cuisines.length > 0
                    ) {
                        setCuisineType(
                            preferences.preferred_cuisines[0]
                        );
                    }

                    // Auto-fill default servings
                    if (
                        preferences.default_servings
                    ) {
                        setServings(
                            preferences.default_servings
                        );
                    }

                    setPreferencesLoaded(true);
                }
            } catch (error) {
                console.error(
                    'Failed to load user preferences:',
                    error
                );

                setPreferencesLoaded(true);
            }
        };

        fetchUserPreferences();
    }, []);

    const addIngredient = () => {
        if (
            inputValue.trim() &&
            !ingredients.includes(
                inputValue.trim()
            )
        ) {
            setIngredients([
                ...ingredients,
                inputValue.trim()
            ]);
            setInputValue('');
        }
    };

    const removeIngredient = (
        ingredient
    ) => {
        setIngredients(
            ingredients.filter(
                (i) => i !== ingredient
            )
        );
    };

    const toggleDietary = (
        option
    ) => {
        if (
            dietaryRestrictions.includes(
                option
            )
        ) {
            setDietaryRestrictions(
                dietaryRestrictions.filter(
                    (d) => d !== option
                )
            );
        } else {
            setDietaryRestrictions([
                ...dietaryRestrictions,
                option
            ]);
        }
    };

    const handleGenerate = async () => {
        if (
            !usePantry &&
            ingredients.length === 0
        ) {
            toast.error(
                'Please add at least one ingredient or use pantry items'
            );
            return;
        }

        setGenerating(true);
        setGeneratedRecipe(null);

        try {
            const response =
                await api.post(
                    '/recipes/generate',
                    {
                        ingredients,
                        usePantryIngredients:
                            usePantry,
                        dietaryRestrictions,
                        cuisineType:
                            cuisineType ===
                            'Any'
                                ? 'any'
                                : cuisineType,
                        servings,
                        cookingTime
                    }
                );

            setGeneratedRecipe(
                response.data.data.recipe
            );

            toast.success(
                'Recipe generated successfully!'
            );
        } catch (error) {
            toast.error(
                error.response?.data
                    ?.message ||
                    'Failed to generate recipe'
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveRecipe =
        async () => {
            if (
                !generatedRecipe
            )
                return;

            setSaving(true);

            try {
                await api.post(
                    '/recipes',
                    {
                        name: generatedRecipe.name,
                        description:
                            generatedRecipe.description,
                        cuisine_type:
                            generatedRecipe.cuisineType,
                        difficulty:
                            generatedRecipe.difficulty,
                        prep_time:
                            generatedRecipe.prepTime,
                        cook_time:
                            generatedRecipe.cookTime,
                        servings:
                            generatedRecipe.servings,
                        instructions:
                            generatedRecipe.instructions,
                        dietary_tags:
                            generatedRecipe.dietaryTags ||
                            [],
                        ingredients:
                            generatedRecipe.ingredients,
                        nutrition:
                            generatedRecipe.nutrition
                    }
                );

                toast.success(
                    'Recipe saved to your collection!'
                );
            } catch (error) {
                toast.error(
                    'Failed to save recipe'
                );
            } finally {
                setSaving(false);
            }
        };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        AI Recipe Generator
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Let AI create
                        delicious recipes
                        based on your
                        ingredients
                    </p>
                </div>

                {/* Keep your remaining UI code same */}
            </div>
        </div>
    );
};

const NutritionBadge = ({
    label,
    value,
    unit
}) => (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-lg font-bold text-gray-900">
            {value}
            {unit}
        </div>

        <div className="text-xs text-gray-600">
            {label}
        </div>
    </div>
);

export default RecipeGenerator;