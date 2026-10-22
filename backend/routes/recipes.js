import express from 'express';
const router = express.Router();

import * as recipeController from '../controllers/recipeController.js';
import authMiddleware from '../middlewares/auth.js';
import rateLimit from '../middlewares/rateLimit.js';

// Limit AI calls per user so nobody can run up the Gemini bill: 20 per hour
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyFn: (req) => req.user.id,
  message: 'AI limit reached, please try again later'
});

// All routes are protected
router.use(authMiddleware);

// AI generation
router.post('/generate', aiLimiter, recipeController.generateRecipe);
router.get('/suggestions', aiLimiter, recipeController.getPantrySuggestions);

// CRUD operations
router.get('/', recipeController.getRecipes);
router.get('/recent', recipeController.getRecentRecipes);
router.get('/stats', recipeController.getRecipeStats);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.saveRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export default router;