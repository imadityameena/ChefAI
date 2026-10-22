import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

if (!process.env.GEMINI_API_KEY) {
  console.error('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
}

const MODEL = "gemini-2.5-flash";

// Error the API can show to the user as-is (502 = upstream AI failed)
const aiError = (message) => {
  const error = new Error(message);
  error.statusCode = 502;
  error.expose = true;
  return error;
};

/**
 * Ask Gemini for JSON and parse it.
 * responseMimeType makes Gemini return raw JSON; the fence stripping is a fallback.
 */
const generateJSON = async (prompt) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const text = (response.text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(text);
};

export const generateRecipe = async ({
  ingredients,
  dietaryRestrictions = [],
  cuisineType = 'any',
  servings = 4,
  cookingTime = 'medium',
  allergies = [],
  measurementUnit = 'metric'
}) => {

  const dietaryInfo = dietaryRestrictions.length > 0
    ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}`
    : 'No dietary restrictions';

  // Allergies are a hard rule: leave the allergen out even if it's in the
  // available ingredients (pantry items get added automatically)
  const allergyInfo = allergies.length > 0
    ? `ALLERGIES (strict): the eater is allergic to ${allergies.join(', ')}. Do NOT use these, any ingredient that contains them, or anything derived from them, even if they appear in the available ingredients. If an ingredient might contain an allergen, leave it out or choose a safe substitute.`
    : 'No allergies';

  const unitInfo = measurementUnit === 'imperial'
    ? 'Units: use US/imperial units (cups, tbsp, tsp, oz, lb, fl oz, °F).'
    : 'Units: use metric units (g, kg, ml, l, tsp, tbsp, °C).';

  const timeGuide = {
    quick: 'under 30 minutes',
    medium: '30-60 minutes',
    long: 'over 60 minutes'
  };

  const prompt = `Generate a detailed recipe with the following requirements:

Ingredients available: ${ingredients.join(', ')}
${dietaryInfo}
${allergyInfo}
${unitInfo}
Cuisine type: ${cuisineType}
Servings: ${servings}
Cooking time: ${timeGuide[cookingTime] || 'any'}

Please provide a complete recipe in the following JSON format (return ONLY valid JSON, no markdown):

{
  "name": "Recipe name",
  "description": "Brief description of the dish",
  "cuisineType": "${cuisineType}",
  "difficulty": "easy|medium|hard",
  "prepTime": number,
  "cookTime": number,
  "servings": ${servings},
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number (use null if it has no amount, e.g. "to taste"),
      "unit": "unit of measurement"
    }
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "dietaryTags": ["vegetarian", "gluten-free"],
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number
  },
  "cookingTips": ["Tip 1", "Tip 2"]
}

Make sure the recipe is creative, delicious, and uses the provided ingredients effectively.`;

  try {
    const recipe = await generateJSON(prompt);

    if (!recipe || typeof recipe !== 'object' || !recipe.name) {
      throw new Error('AI response is missing a recipe name');
    }

    return recipe;
  } catch (error) {
    console.error('Gemini API error (generateRecipe):', error);
    throw aiError('Failed to generate recipe, please try again');
  }
};

export const generatePantrySuggestions = async (
  pantryItems,
  expiringItems = []
) => {

  const ingredients = pantryItems.map(item => item.name).join(', ');

  const expiringText = expiringItems.length > 0
    ? `\nPriority ingredients (expiring soon): ${expiringItems.join(', ')}`
    : '';

  const prompt = `Based on these available ingredients: ${ingredients}${expiringText}

Suggest 3 creative recipe ideas that use these ingredients. Return ONLY a JSON array of strings (no markdown):

["Recipe idea 1", "Recipe idea 2", "Recipe idea 3"]

Each suggestion should be a brief, appetizing description (1-2 sentences).`;

  try {
    const suggestions = await generateJSON(prompt);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Gemini API error (generatePantrySuggestions):", error);
    throw aiError("Failed to generate suggestions, please try again");
  }
};

export const generateCookingTips = async (recipe) => {

  const prompt = `For this recipe: "${recipe.name}"
Ingredients: ${recipe.ingredients?.map(i => i.name).join(', ') || 'N/A'}

Provide 3-5 helpful cooking tips to make this recipe better. Return ONLY a JSON array of strings (no markdown):

["Tip 1", "Tip 2", "Tip 3"]`;

  try {
    const tips = await generateJSON(prompt);
    return Array.isArray(tips) ? tips : ['Cook with love and patience!'];
  } catch (error) {
    console.error('Gemini API error (generateCookingTips):', error);
    return ['Cook with love and patience!'];
  }
};

export default {
  generateRecipe,
  generatePantrySuggestions,
  generateCookingTips
};