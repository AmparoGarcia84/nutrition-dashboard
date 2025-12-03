// Integración con Spoonacular API
// Documentación: https://spoonacular.com/food-api/docs
// Plan gratuito: 150 puntos/día

const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export interface MealPlanDay {
  meals: Meal[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

export interface Meal {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string;
  extendedIngredients: Ingredient[];
  nutrition?: {
    nutrients: Nutrient[];
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
  };
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface SearchResult {
  id: number;
  title: string;
  image: string;
  imageType: string;
}

// Verificar si la API key está configurada
export function isApiConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'tu_api_key_aqui';
}

// Generar plan de comidas diario
// Costo: 1 punto
export async function generateMealPlanDay(
  targetCalories: number = 2000,
  diet?: string, // vegetarian, vegan, paleo, ketogenic, etc.
  exclude?: string // ingredientes a excluir separados por coma
): Promise<MealPlanDay | null> {
  if (!isApiConfigured()) {
    console.warn('Spoonacular API key no configurada');
    return null;
  }

  try {
    const params = new URLSearchParams({
      apiKey: API_KEY!,
      timeFrame: 'day',
      targetCalories: targetCalories.toString(),
    });

    if (diet) params.append('diet', diet);
    if (exclude) params.append('exclude', exclude);

    const response = await fetch(
      `${BASE_URL}/mealplanner/generate?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generando plan de comidas:', error);
    return null;
  }
}

// Generar plan de comidas semanal
// Costo: 1 punto
export async function generateMealPlanWeek(
  targetCalories: number = 2000,
  diet?: string,
  exclude?: string
): Promise<{ week: Record<string, MealPlanDay> } | null> {
  if (!isApiConfigured()) {
    console.warn('Spoonacular API key no configurada');
    return null;
  }

  try {
    const params = new URLSearchParams({
      apiKey: API_KEY!,
      timeFrame: 'week',
      targetCalories: targetCalories.toString(),
    });

    if (diet) params.append('diet', diet);
    if (exclude) params.append('exclude', exclude);

    const response = await fetch(
      `${BASE_URL}/mealplanner/generate?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generando plan semanal:', error);
    return null;
  }
}

// Obtener información de una receta
// Costo: 1 punto
export async function getRecipeInfo(recipeId: number): Promise<Recipe | null> {
  if (!isApiConfigured()) return null;

  try {
    const params = new URLSearchParams({
      apiKey: API_KEY!,
      includeNutrition: 'true',
    });

    const response = await fetch(
      `${BASE_URL}/recipes/${recipeId}/information?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo receta:', error);
    return null;
  }
}

// Buscar recetas
// Costo: 1 punto
export async function searchRecipes(
  query: string,
  options?: {
    diet?: string;
    cuisine?: string;
    maxCalories?: number;
    minProtein?: number;
    number?: number;
  }
): Promise<{ results: SearchResult[]; totalResults: number } | null> {
  if (!isApiConfigured()) return null;

  try {
    const params = new URLSearchParams({
      apiKey: API_KEY!,
      query,
      number: (options?.number || 10).toString(),
      addRecipeInformation: 'true',
    });

    if (options?.diet) params.append('diet', options.diet);
    if (options?.cuisine) params.append('cuisine', options.cuisine);
    if (options?.maxCalories) params.append('maxCalories', options.maxCalories.toString());
    if (options?.minProtein) params.append('minProtein', options.minProtein.toString());

    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error buscando recetas:', error);
    return null;
  }
}

// Obtener recetas aleatorias
// Costo: 1 punto
export async function getRandomRecipes(
  number: number = 3,
  tags?: string // vegetarian,dessert separados por coma
): Promise<{ recipes: Recipe[] } | null> {
  if (!isApiConfigured()) return null;

  try {
    const params = new URLSearchParams({
      apiKey: API_KEY!,
      number: number.toString(),
    });

    if (tags) params.append('tags', tags);

    const response = await fetch(
      `${BASE_URL}/recipes/random?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo recetas aleatorias:', error);
    return null;
  }
}

// Tipos de dietas disponibles en Spoonacular
export const DIETAS_DISPONIBLES = [
  { value: '', label: 'Sin restricción' },
  { value: 'vegetarian', label: 'Vegetariana' },
  { value: 'vegan', label: 'Vegana' },
  { value: 'gluten free', label: 'Sin gluten' },
  { value: 'ketogenic', label: 'Cetogénica (Keto)' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'pescetarian', label: 'Pescetariana' },
  { value: 'lacto vegetarian', label: 'Lacto-vegetariana' },
  { value: 'ovo vegetarian', label: 'Ovo-vegetariana' },
  { value: 'whole30', label: 'Whole30' },
  { value: 'primal', label: 'Primal' },
  { value: 'low fodmap', label: 'Baja en FODMAP' },
];

// Generar URL de imagen de receta
export function getRecipeImageUrl(recipeId: number, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizes = {
    small: '100x100',
    medium: '312x231', 
    large: '556x370',
  };
  return `https://spoonacular.com/recipeImages/${recipeId}-${sizes[size]}.jpg`;
}

