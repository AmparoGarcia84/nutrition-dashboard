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

// Buscar receta aleatoria que coincida con los criterios y obtener su información nutricional
async function findRecipeByCriteria(
  ingredients: string,
  diet?: string,
  exclude?: string,
  maxCalories?: number
): Promise<{
  meal: Meal;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
} | null> {
  if (!isApiConfigured()) return null;

  try {
    // Procesar ingredientes: separar por comas, limpiar espacios y unir sin espacios
    const ingredientsList = ingredients
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0)
      .join(',');

    if (!ingredientsList) {
      console.warn('No se proporcionaron ingredientes válidos');
      return null;
    }

    const params = new URLSearchParams({
      apiKey: API_KEY!,
      includeIngredients: ingredientsList,
      number: '10',
      addRecipeInformation: 'true',
    });

    if (diet) params.append('diet', diet);
    if (exclude) params.append('exclude', exclude);
    if (maxCalories) params.append('maxCalories', maxCalories.toString());

    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en la API: ${response.status} - ${errorText}`);
      
      // Si es un error 402 (límite de puntos), lanzar un error específico
      if (response.status === 402) {
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`402: ${errorData.message || 'Límite de puntos alcanzado'}`);
        } catch {
          throw new Error('402: Límite de puntos alcanzado');
        }
      }
      
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Seleccionar una receta aleatoria de los resultados
      const randomRecipe = data.results[Math.floor(Math.random() * data.results.length)];
      
      // Construir el objeto Meal desde la búsqueda (evita una llamada adicional)
      const meal: Meal = {
        id: randomRecipe.id,
        title: randomRecipe.title,
        readyInMinutes: randomRecipe.readyInMinutes || 0,
        servings: randomRecipe.servings || 1,
        sourceUrl: randomRecipe.sourceUrl || `https://spoonacular.com/recipes/${randomRecipe.id}`,
        image: randomRecipe.image || getRecipeImageUrl(randomRecipe.id),
      };

      // Estimar valores nutricionales basados en calorías objetivo si no hay información
      // Esto evita hacer una llamada adicional a getRecipeInfo
      // Nota: Estos son valores estimados, para valores exactos se necesitaría la llamada adicional
      const estimatedCalories = maxCalories || 500;
      const nutrition = {
        calories: estimatedCalories,
        protein: Math.round(estimatedCalories * 0.15 / 4), // ~15% de proteínas
        fat: Math.round(estimatedCalories * 0.30 / 9), // ~30% de grasas
        carbohydrates: Math.round(estimatedCalories * 0.55 / 4), // ~55% de carbohidratos
      };

      return { meal, nutrition };
    }

    return null;
  } catch (error) {
    console.error('Error buscando receta:', error);
    return null;
  }
}

// Generar plan de comidas semanal con reglas específicas
// Costo: ~14-17 puntos (1 búsqueda + 1 info por receta, ~2-3 recetas por día x 7 días)
export async function generateMealPlanWeek(
  targetCalories: number = 2000,
  diet?: string,
  exclude?: string,
  macros?: {
    protein?: number; // % de proteínas
    carbs?: number;   // % de hidratos
    fat?: number;     // % de grasas
  }
): Promise<{ week: Record<string, MealPlanDay> } | null> {
  if (!isApiConfigured()) {
    console.warn('Spoonacular API key no configurada');
    return null;
  }

  try {
    const week: Record<string, MealPlanDay> = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Calorías aproximadas por comida (desayuno 25%, comida 40%, cena 35%)
    const breakfastCalories = Math.round(targetCalories * 0.25);
    const lunchCalories = Math.round(targetCalories * 0.40);
    const dinnerCalories = Math.round(targetCalories * 0.35);

    // Reglas para cada día
    const mealRules: Record<string, { breakfast: string; lunch: string | null; dinner: string | null }> = {
      monday: {
        breakfast: 'oatmeal, fruits',
        lunch: 'beans, vegetables',
        dinner: 'vegetables, tofu'
      },
      tuesday: {
        breakfast: 'oatmeal, fruits',
        lunch: 'salmon',
        dinner: 'egg, vegetables'
      },
      wednesday: {
        breakfast: 'oatmeal, fruits',
        lunch: 'tofu, vegetables',
        dinner: 'egg, vegetables'
      },
      thursday: {
        breakfast: 'oatmeal, fruits',
        lunch: 'lentils, vegetables',
        dinner: 'tofu'
      },
      friday: {
        breakfast: 'oatmeal, fruits',
        lunch: 'fish, cod',
        dinner: 'pizza'
      },
      saturday: {
        breakfast: 'oatmeal, fruits',
        lunch: 'seafood shrimp',
        dinner: null // Cena libre
      },
      sunday: {
        breakfast: 'oatmeal, fruits',
        lunch: null, // Comida libre
        dinner: null // Cena libre
      }
    };

    for (const day of days) {
      const rules = mealRules[day];
      const meals: Meal[] = [];
      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;

      // Desayuno: siempre con fruta y avena
      const breakfastResult = await findRecipeByCriteria(
        rules.breakfast,
        diet,
        exclude,
        breakfastCalories
      );
      if (breakfastResult) {
        meals.push(breakfastResult.meal);
        totalCalories += breakfastResult.nutrition.calories;
        totalProtein += breakfastResult.nutrition.protein;
        totalFat += breakfastResult.nutrition.fat;
        totalCarbs += breakfastResult.nutrition.carbohydrates;
      }

      // Comida: según el día
      if (rules.lunch) {
        const lunchResult = await findRecipeByCriteria(
          rules.lunch,
          diet,
          exclude,
          lunchCalories
        );
        if (lunchResult) {
          meals.push(lunchResult.meal);
          totalCalories += lunchResult.nutrition.calories;
          totalProtein += lunchResult.nutrition.protein;
          totalFat += lunchResult.nutrition.fat;
          totalCarbs += lunchResult.nutrition.carbohydrates;
        }
      }

      // Cena: según el día
      if (rules.dinner) {
        const dinnerResult = await findRecipeByCriteria(
          rules.dinner,
          diet,
          exclude,
          dinnerCalories
        );
        if (dinnerResult) {
          meals.push(dinnerResult.meal);
          totalCalories += dinnerResult.nutrition.calories;
          totalProtein += dinnerResult.nutrition.protein;
          totalFat += dinnerResult.nutrition.fat;
          totalCarbs += dinnerResult.nutrition.carbohydrates;
        }
      }

      week[day] = {
        meals,
        nutrients: {
          calories: totalCalories,
          protein: totalProtein,
          fat: totalFat,
          carbohydrates: totalCarbs,
        },
      };
    }

    return { week };
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

