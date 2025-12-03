'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { 
  generateMealPlanDay, 
  generateMealPlanWeek,
  getRecipeInfo,
  isApiConfigured,
  DIETAS_DISPONIBLES,
  type MealPlanDay,
  type Recipe
} from '@/lib/spoonacular';
import { 
  Utensils, 
  Flame, 
  Clock, 
  Users,
  ChefHat,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Loader2,
  Calendar,
  CalendarDays
} from 'lucide-react';

interface GeneradorDietasProps {
  pacienteId: string;
  pacienteNombre: string;
}

export default function GeneradorDietas({ pacienteId, pacienteNombre }: GeneradorDietasProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanDay | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  
  // Opciones del generador
  const [calorias, setCalorias] = useState(2000);
  const [dieta, setDieta] = useState('');
  const [excluir, setExcluir] = useState('');

  const apiConfigured = isApiConfigured();

  const handleGenerarDiario = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedRecipe(null);

    try {
      const plan = await generateMealPlanDay(
        calorias,
        dieta || undefined,
        excluir || undefined
      );

      if (plan) {
        setMealPlan(plan);
      } else {
        setError('No se pudo generar el plan. Verifica la API key.');
      }
    } catch (err) {
      setError('Error al conectar con Spoonacular');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerReceta = async (recipeId: number) => {
    setLoadingRecipe(true);
    try {
      const recipe = await getRecipeInfo(recipeId);
      setSelectedRecipe(recipe);
    } catch (err) {
      console.error('Error cargando receta:', err);
    } finally {
      setLoadingRecipe(false);
    }
  };

  // Si la API no está configurada, mostrar instrucciones
  if (!apiConfigured) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <AlertCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Configura Spoonacular API
          </h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Para generar dietas personalizadas, necesitas una API key de Spoonacular (gratis).
          </p>
          
          <div className="bg-background rounded-xl p-6 text-left max-w-lg mx-auto">
            <h4 className="font-semibold text-foreground mb-3">📋 Pasos para configurar:</h4>
            <ol className="space-y-3 text-sm text-muted">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>
                  Ve a{' '}
                  <a 
                    href="https://spoonacular.com/food-api/console#Dashboard" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    spoonacular.com/food-api
                  </a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Crea una cuenta gratis (sin tarjeta)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Copia tu API Key del Dashboard</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>
                  Crea un archivo <code className="bg-muted-light px-1 rounded">.env.local</code> con:
                </span>
              </li>
            </ol>
            <pre className="mt-3 bg-sidebar text-white p-3 rounded-lg text-xs overflow-x-auto">
              NEXT_PUBLIC_SPOONACULAR_API_KEY=tu_api_key_aqui
            </pre>
            <p className="mt-3 text-xs text-muted">
              💡 Plan gratuito: 150 puntos/día (suficiente para ~150 consultas)
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuración del generador */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Generador de Dietas con IA</h3>
            <p className="text-sm text-muted">Powered by Spoonacular</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Calorías objetivo
            </label>
            <div className="relative">
              <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="number"
                value={calorias}
                onChange={(e) => setCalorias(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground"
                min={1200}
                max={4000}
                step={100}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tipo de dieta
            </label>
            <select
              value={dieta}
              onChange={(e) => setDieta(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground"
            >
              {DIETAS_DISPONIBLES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Excluir ingredientes
            </label>
            <input
              type="text"
              value={excluir}
              onChange={(e) => setExcluir(e.target.value)}
              placeholder="ej: gluten, lactosa"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleGenerarDiario}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Generar Plan Diario
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-danger-light rounded-xl text-danger text-sm">
            {error}
          </div>
        )}
      </Card>

      {/* Resultados del plan */}
      {mealPlan && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">
              Plan para {pacienteNombre}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-accent">
                <Flame className="w-4 h-4" />
                {Math.round(mealPlan.nutrients.calories)} kcal
              </span>
              <span className="text-muted">
                P: {Math.round(mealPlan.nutrients.protein)}g
              </span>
              <span className="text-muted">
                C: {Math.round(mealPlan.nutrients.carbohydrates)}g
              </span>
              <span className="text-muted">
                G: {Math.round(mealPlan.nutrients.fat)}g
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mealPlan.meals.map((meal, index) => (
              <div
                key={meal.id}
                className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40">
                  <img
                    src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`}
                    alt={meal.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                      {index === 0 ? '🌅 Desayuno' : index === 1 ? '☀️ Almuerzo' : '🌙 Cena'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-foreground line-clamp-2 mb-2">
                    {meal.title}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.readyInMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meal.servings} pers.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVerReceta(meal.id)}
                      disabled={loadingRecipe}
                      className="flex-1"
                    >
                      {loadingRecipe ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Ver receta'
                      )}
                    </Button>
                    <a
                      href={meal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-border hover:bg-muted-light transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-muted" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detalle de receta */}
      {selectedRecipe && (
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="w-32 h-32 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {selectedRecipe.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedRecipe.diets?.map((diet) => (
                  <span 
                    key={diet}
                    className="px-2 py-1 bg-primary-light text-primary-dark text-xs rounded-full"
                  >
                    {diet}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedRecipe.readyInMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedRecipe.servings} porciones
                </span>
                {selectedRecipe.nutrition && (
                  <span className="flex items-center gap-1 text-accent">
                    <Flame className="w-4 h-4" />
                    {Math.round(selectedRecipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0)} kcal
                  </span>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedRecipe(null)}
            >
              ✕
            </Button>
          </div>

          {/* Ingredientes */}
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Ingredientes
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedRecipe.extendedIngredients?.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{ing.original}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instrucciones */}
          {selectedRecipe.instructions && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">📝 Instrucciones</h4>
              <div 
                className="text-sm text-muted prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
              />
            </div>
          )}

          {/* Nutrición */}
          {selectedRecipe.nutrition && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold text-foreground mb-3">🥗 Información Nutricional</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedRecipe.nutrition.nutrients.slice(0, 8).map((nutrient) => (
                  <div key={nutrient.name} className="text-center p-3 bg-background rounded-xl">
                    <p className="text-lg font-bold text-foreground">
                      {Math.round(nutrient.amount)}{nutrient.unit}
                    </p>
                    <p className="text-xs text-muted">{nutrient.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

