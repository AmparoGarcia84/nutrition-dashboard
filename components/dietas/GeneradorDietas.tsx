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
  traducirTitulo,
  traducirIngrediente,
  traducirDieta,
  traducirTipoPlato,
  traducirNutriente,
} from '@/lib/translations';
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
  CalendarDays,
  Percent,
  TrendingUp,
  Save
} from 'lucide-react';
import { useDietas } from '@/lib/hooks';

interface GeneradorDietasProps {
  pacienteId: string;
  pacienteNombre: string;
  onDietaGuardada?: () => void;
}

type PlanType = 'day' | 'week';

interface MealPlanWeek {
  week: Record<string, MealPlanDay>;
}

export default function GeneradorDietas({ pacienteId, pacienteNombre, onDietaGuardada }: GeneradorDietasProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanDay | null>(null);
  const [mealPlanWeek, setMealPlanWeek] = useState<MealPlanWeek | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [planType, setPlanType] = useState<PlanType>('week');
  const [saving, setSaving] = useState(false);
  const [dietaNombre, setDietaNombre] = useState('');
  
  // Opciones del generador
  const [calorias, setCalorias] = useState(2000);
  const [dieta, setDieta] = useState('');
  const [excluir, setExcluir] = useState('');
  
  // Filtros de macronutrientes
  const [proteinPercent, setProteinPercent] = useState<number>(30);
  const [carbsPercent, setCarbsPercent] = useState<number>(40);
  const [fatPercent, setFatPercent] = useState<number>(30);
  const [showMacros, setShowMacros] = useState(false);

  const apiConfigured = isApiConfigured();
  const { createDieta } = useDietas(pacienteId);

  // Validar que los macronutrientes sumen 100%
  const macrosSum = proteinPercent + carbsPercent + fatPercent;
  const macrosValid = Math.abs(macrosSum - 100) < 1; // Permitir pequeña diferencia por redondeo

  const handleGenerarPlan = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedRecipe(null);
    setMealPlan(null);
    setMealPlanWeek(null);

    try {
      if (planType === 'day') {
        const plan = await generateMealPlanDay(
          calorias,
          dieta || undefined,
          excluir || undefined
        );

        if (plan) {
          // Aplicar traducciones
          const planTraducido = {
            ...plan,
            meals: plan.meals.map(meal => ({
              ...meal,
              title: traducirTitulo(meal.title)
            }))
          };
          setMealPlan(planTraducido);
        } else {
          setError('No se pudo generar el plan. Verifica la API key.');
        }
      } else {
        const plan = await generateMealPlanWeek(
          calorias,
          dieta || undefined,
          excluir || undefined,
          showMacros ? {
            protein: proteinPercent,
            carbs: carbsPercent,
            fat: fatPercent
          } : undefined
        );

        if (plan) {
          // Aplicar traducciones a todos los días
          const weekTraducido: MealPlanWeek = {
            week: Object.fromEntries(
              Object.entries(plan.week).map(([day, dayPlan]) => [
                day,
                {
                  ...dayPlan,
                  meals: dayPlan.meals.map(meal => ({
                    ...meal,
                    title: traducirTitulo(meal.title)
                  }))
                }
              ])
            )
          };
          setMealPlanWeek(weekTraducido);
        } else {
          setError('No se pudo generar el plan. Verifica la API key.');
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('402') || err?.message?.includes('points limit')) {
        setError('Has alcanzado el límite diario de puntos de la API (50 puntos). El límite se reinicia cada 24 horas. Por favor, intenta de nuevo mañana o considera actualizar tu plan de Spoonacular.');
      } else {
        setError('Error al conectar con Spoonacular. Verifica tu conexión e intenta de nuevo.');
      }
      console.error('Error generando plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerReceta = async (recipeId: number) => {
    setLoadingRecipe(true);
    try {
      const recipe = await getRecipeInfo(recipeId);
      if (recipe) {
        // Aplicar traducciones
        const recipeTraducido: Recipe = {
          ...recipe,
          title: traducirTitulo(recipe.title),
          diets: recipe.diets?.map(d => traducirDieta(d)),
          dishTypes: recipe.dishTypes?.map(d => traducirTipoPlato(d)),
          extendedIngredients: recipe.extendedIngredients?.map(ing => ({
            ...ing,
            original: traducirIngrediente(ing.original),
            name: traducirIngrediente(ing.name)
          })),
          nutrition: recipe.nutrition ? {
            ...recipe.nutrition,
            nutrients: recipe.nutrition.nutrients.map(nut => ({
              ...nut,
              name: traducirNutriente(nut.name)
            }))
          } : undefined
        };
        setSelectedRecipe(recipeTraducido);
      }
    } catch (err) {
      console.error('Error cargando receta:', err);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleGuardarPlan = async () => {
    if (!mealPlanWeek && !mealPlan) {
      setError('No hay un plan generado para guardar');
      return;
    }

    if (!dietaNombre.trim()) {
      setError('Por favor, ingresa un nombre para la dieta');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fechaInicio = new Date().toISOString().split('T')[0];
      const fechaFin = planType === 'week' 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let comidas: any[] = [];

      if (planType === 'week' && mealPlanWeek) {
        // Convertir plan semanal a formato de comidas
        const diasSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        
        diasSemana.forEach((dia, index) => {
          const dayPlan = mealPlanWeek.week[dia];
          if (dayPlan && dayPlan.meals) {
            dayPlan.meals.forEach((meal, mealIndex) => {
              const tipo = mealIndex === 0 ? 'desayuno' : mealIndex === 1 ? 'almuerzo' : 'cena';
              comidas.push({
                ...meal,
                tipo,
                dia: nombresDias[index],
                diaNumero: index + 1
              });
            });
          }
        });
      } else if (planType === 'day' && mealPlan) {
        // Convertir plan diario a formato de comidas
        mealPlan.meals.forEach((meal, index) => {
          const tipo = index === 0 ? 'desayuno' : index === 1 ? 'almuerzo' : 'cena';
          comidas.push({
            ...meal,
            tipo,
            dia: 'Hoy',
            diaNumero: 1
          });
        });
      }

      const dietaData = {
        paciente_id: pacienteId,
        nombre: dietaNombre.trim(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        calorias: calorias,
        comidas: comidas,
        notas: dieta ? `Tipo de dieta: ${dieta}` : null
      };

      const saved = await createDieta(dietaData);
      
      if (saved) {
        setError(null);
        setDietaNombre('');
        // Llamar al callback para refrescar la lista
        if (onDietaGuardada) {
          onDietaGuardada();
        }
        // Mostrar mensaje de éxito (podrías usar un toast aquí)
        alert('Dieta guardada correctamente');
      } else {
        setError('Error al guardar la dieta');
      }
    } catch (err: any) {
      console.error('Error guardando dieta:', err);
      setError('Error al guardar la dieta: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // Ajustar macronutrientes automáticamente
  const ajustarMacros = (tipo: 'protein' | 'carbs' | 'fat', nuevoValor: number) => {
    let otrosMacros: { protein?: number; carbs?: number; fat?: number };
    
    if (tipo === 'protein') {
      otrosMacros = { carbs: carbsPercent, fat: fatPercent };
    } else if (tipo === 'carbs') {
      otrosMacros = { protein: proteinPercent, fat: fatPercent };
    } else {
      otrosMacros = { protein: proteinPercent, carbs: carbsPercent };
    }
    
    const sumaOtros = (otrosMacros.protein || 0) + (otrosMacros.carbs || 0) + (otrosMacros.fat || 0);
    const total = nuevoValor + sumaOtros;
    
    if (total > 100) {
      // Reducir proporcionalmente los otros
      const factor = (100 - nuevoValor) / sumaOtros;
      if (tipo === 'protein') {
        setCarbsPercent(Math.round((otrosMacros.carbs || 0) * factor));
        setFatPercent(Math.round((otrosMacros.fat || 0) * factor));
      } else if (tipo === 'carbs') {
        setProteinPercent(Math.round((otrosMacros.protein || 0) * factor));
        setFatPercent(Math.round((otrosMacros.fat || 0) * factor));
      } else {
        setProteinPercent(Math.round((otrosMacros.protein || 0) * factor));
        setCarbsPercent(Math.round((otrosMacros.carbs || 0) * factor));
      }
    }
    
    if (tipo === 'protein') setProteinPercent(nuevoValor);
    else if (tipo === 'carbs') setCarbsPercent(nuevoValor);
    else setFatPercent(nuevoValor);
  };

  // Nombres de días en español
  const diasSemana: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
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

        {/* Selector de tipo de plan */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de Plan
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setPlanType('week')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                planType === 'week'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-muted hover:text-foreground border border-border'
              }`}
            >
              <CalendarDays className="w-4 h-4 inline mr-2" />
              Plan Semanal
            </button>
            <button
              onClick={() => setPlanType('day')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                planType === 'day'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-muted hover:text-foreground border border-border'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Plan Diario
            </button>
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

        {/* Filtros de macronutrientes */}
        <div className="mb-6">
          <button
            onClick={() => setShowMacros(!showMacros)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <Percent className="w-4 h-4" />
            {showMacros ? 'Ocultar' : 'Mostrar'} filtros de macronutrientes
            <TrendingUp className="w-4 h-4" />
          </button>

          {showMacros && (
            <div className="mt-4 p-4 bg-background rounded-xl border border-border">
              <p className="text-sm text-muted mb-4">
                Distribución de macronutrientes (debe sumar 100%)
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">
                    Proteínas: {proteinPercent}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={proteinPercent}
                    onChange={(e) => ajustarMacros('protein', Number(e.target.value))}
                    className="w-full h-2 bg-muted-light rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">
                    Hidratos: {carbsPercent}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={carbsPercent}
                    onChange={(e) => ajustarMacros('carbs', Number(e.target.value))}
                    className="w-full h-2 bg-muted-light rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">
                    Grasas: {fatPercent}%
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    value={fatPercent}
                    onChange={(e) => ajustarMacros('fat', Number(e.target.value))}
                    className="w-full h-2 bg-muted-light rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className={`${macrosValid ? 'text-success' : 'text-danger'}`}>
                  Total: {macrosSum}%
                </span>
                {!macrosValid && (
                  <span className="text-danger">⚠️ Debe sumar 100%</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleGenerarPlan}
            disabled={isLoading || (showMacros && !macrosValid)}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              planType === 'week' ? <CalendarDays className="w-4 h-4" /> : <Calendar className="w-4 h-4" />
            )}
            Generar Plan {planType === 'week' ? 'Semanal' : 'Diario'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-danger-light rounded-xl text-danger text-sm">
            {error}
          </div>
        )}
      </Card>

      {/* Resultados del plan diario */}
      {mealPlan && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">
              Plan Diario para {pacienteNombre}
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={dietaNombre}
                onChange={(e) => setDietaNombre(e.target.value)}
                placeholder="Nombre de la dieta"
                className="px-4 py-2 rounded-xl border border-border bg-white text-foreground"
              />
              <Button
                onClick={handleGuardarPlan}
                disabled={saving || !dietaNombre.trim()}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar Plan
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-accent">
                <Flame className="w-4 h-4" />
                {Math.round(mealPlan.nutrients.calories)} kcal
              </span>
              <span className="text-muted">
                P: {Math.round(mealPlan.nutrients.protein)}g ({Math.round((mealPlan.nutrients.protein * 4 / mealPlan.nutrients.calories) * 100)}%)
              </span>
              <span className="text-muted">
                C: {Math.round(mealPlan.nutrients.carbohydrates)}g ({Math.round((mealPlan.nutrients.carbohydrates * 4 / mealPlan.nutrients.calories) * 100)}%)
              </span>
              <span className="text-muted">
                G: {Math.round(mealPlan.nutrients.fat)}g ({Math.round((mealPlan.nutrients.fat * 9 / mealPlan.nutrients.calories) * 100)}%)
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

      {/* Resultados del plan semanal */}
      {mealPlanWeek && (
        <div className="space-y-6">
          {/* Botón para guardar plan semanal */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Plan Semanal Generado
                </h3>
                <p className="text-sm text-muted">
                  Guarda este plan para poder consultarlo más tarde
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={dietaNombre}
                  onChange={(e) => setDietaNombre(e.target.value)}
                  placeholder="Nombre de la dieta"
                  className="px-4 py-2 rounded-xl border border-border bg-white text-foreground"
                />
                <Button
                  onClick={handleGuardarPlan}
                  disabled={saving || !dietaNombre.trim()}
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Plan
                </Button>
              </div>
            </div>
          </Card>

          {Object.entries(mealPlanWeek.week).map(([day, dayPlan]) => (
            <Card key={day}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {diasSemana[day] || day}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-accent">
                    <Flame className="w-4 h-4" />
                    {Math.round(dayPlan.nutrients.calories)} kcal
                  </span>
                  <span className="text-muted">
                    P: {Math.round(dayPlan.nutrients.protein)}g
                  </span>
                  <span className="text-muted">
                    C: {Math.round(dayPlan.nutrients.carbohydrates)}g
                  </span>
                  <span className="text-muted">
                    G: {Math.round(dayPlan.nutrients.fat)}g
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Desayuno - siempre presente */}
                {dayPlan.meals[0] ? (
                  <div
                    key={dayPlan.meals[0].id}
                    className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40">
                      <img
                        src={`https://spoonacular.com/recipeImages/${dayPlan.meals[0].id}-312x231.jpg`}
                        alt={dayPlan.meals[0].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                          🌅 Desayuno
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-foreground line-clamp-2 mb-2">
                        {dayPlan.meals[0].title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dayPlan.meals[0].readyInMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {dayPlan.meals[0].servings} pers.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerReceta(dayPlan.meals[0].id)}
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
                          href={dayPlan.meals[0].sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg border border-border hover:bg-muted-light transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-muted" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Comida/Almuerzo */}
                {dayPlan.meals[1] ? (
                  <div
                    key={dayPlan.meals[1].id}
                    className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40">
                      <img
                        src={`https://spoonacular.com/recipeImages/${dayPlan.meals[1].id}-312x231.jpg`}
                        alt={dayPlan.meals[1].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                          ☀️ Almuerzo
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-foreground line-clamp-2 mb-2">
                        {dayPlan.meals[1].title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dayPlan.meals[1].readyInMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {dayPlan.meals[1].servings} pers.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerReceta(dayPlan.meals[1].id)}
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
                          href={dayPlan.meals[1].sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg border border-border hover:bg-muted-light transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-muted" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-muted-light/30">
                    <span className="text-4xl mb-3">🍽️</span>
                    <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium mb-2">
                      ☀️ Almuerzo
                    </span>
                    <p className="text-sm font-medium text-foreground mb-1">Comida Libre</p>
                    <p className="text-xs text-muted text-center">Disfruta de tu comida favorita</p>
                  </div>
                )}

                {/* Cena */}
                {dayPlan.meals[2] ? (
                  <div
                    key={dayPlan.meals[2].id}
                    className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40">
                      <img
                        src={`https://spoonacular.com/recipeImages/${dayPlan.meals[2].id}-312x231.jpg`}
                        alt={dayPlan.meals[2].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                          🌙 Cena
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-foreground line-clamp-2 mb-2">
                        {dayPlan.meals[2].title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dayPlan.meals[2].readyInMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {dayPlan.meals[2].servings} pers.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerReceta(dayPlan.meals[2].id)}
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
                          href={dayPlan.meals[2].sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg border border-border hover:bg-muted-light transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-muted" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-muted-light/30">
                    <span className="text-4xl mb-3">🍽️</span>
                    <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium mb-2">
                      🌙 Cena
                    </span>
                    <p className="text-sm font-medium text-foreground mb-1">Cena Libre</p>
                    <p className="text-xs text-muted text-center">Disfruta de tu cena favorita</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
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
                    {Math.round(selectedRecipe.nutrition.nutrients.find(n => n.name === 'Calorías' || n.name === 'Calories')?.amount || 0)} kcal
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
