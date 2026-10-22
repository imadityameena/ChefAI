// Shared option lists, so every page offers the same choices.

export const CUISINES = [
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'Thai',
  'French',
  'Mediterranean',
  'American',
];

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
];

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const COOKING_TIMES = [
  { value: 'quick', label: 'Quick', hint: 'Under 30 min' },
  { value: 'medium', label: 'Standard', hint: '30–60 min' },
  { value: 'long', label: 'Slow', hint: 'Over an hour' },
];

// Used by both the pantry and the shopping list, so bought items
// land in the pantry with a matching category and unit.
export const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat & Fish',
  'Grains',
  'Spices',
  'Baking',
  'Drinks',
  'Other',
];

export const UNITS = ['pieces', 'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'pack'];

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
];
