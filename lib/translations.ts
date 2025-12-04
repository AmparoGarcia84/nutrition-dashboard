// Traducciones de términos comunes de Spoonacular a español

export const traduccionesComidas: Record<string, string> = {
  'breakfast': 'Desayuno',
  'lunch': 'Almuerzo',
  'dinner': 'Cena',
  'snack': 'Merienda',
  'brunch': 'Brunch',
  'teatime': 'Hora del té',
};

export const traduccionesTiposPlato: Record<string, string> = {
  'main course': 'Plato principal',
  'side dish': 'Acompañamiento',
  'dessert': 'Postre',
  'appetizer': 'Aperitivo',
  'salad': 'Ensalada',
  'bread': 'Pan',
  'breakfast': 'Desayuno',
  'soup': 'Sopa',
  'beverage': 'Bebida',
  'sauce': 'Salsa',
  'marinade': 'Marinada',
  'fingerfood': 'Comida para picar',
  'snack': 'Snack',
  'drink': 'Bebida',
};

export const traduccionesDietas: Record<string, string> = {
  'vegetarian': 'Vegetariana',
  'vegan': 'Vegana',
  'gluten free': 'Sin gluten',
  'ketogenic': 'Cetogénica',
  'paleo': 'Paleo',
  'pescetarian': 'Pescetariana',
  'lacto vegetarian': 'Lacto-vegetariana',
  'ovo vegetarian': 'Ovo-vegetariana',
  'whole30': 'Whole30',
  'primal': 'Primal',
  'low fodmap': 'Baja en FODMAP',
};

export const traduccionesNutrientes: Record<string, string> = {
  'Calories': 'Calorías',
  'Protein': 'Proteína',
  'Fat': 'Grasa',
  'Carbohydrates': 'Hidratos de carbono',
  'Fiber': 'Fibra',
  'Sugar': 'Azúcar',
  'Sodium': 'Sodio',
  'Calcium': 'Calcio',
  'Iron': 'Hierro',
  'Vitamin A': 'Vitamina A',
  'Vitamin C': 'Vitamina C',
  'Vitamin D': 'Vitamina D',
  'Cholesterol': 'Colesterol',
  'Saturated Fat': 'Grasa saturada',
  'Trans Fat': 'Grasa trans',
  'Unsaturated Fat': 'Grasa insaturada',
};

// Función para traducir texto usando la API de traducción de Google (gratis)
// Alternativa: usar un servicio de traducción o hacer traducciones manuales
export async function traducirTexto(texto: string, idiomaDestino: string = 'es'): Promise<string> {
  // Si el texto ya está en español o es muy corto, no traducir
  if (texto.length < 3) return texto;
  
  // Primero intentar traducciones manuales comunes
  const traduccionesComunes: Record<string, string> = {
    'chicken': 'pollo',
    'beef': 'ternera',
    'pork': 'cerdo',
    'fish': 'pescado',
    'salmon': 'salmón',
    'rice': 'arroz',
    'pasta': 'pasta',
    'bread': 'pan',
    'cheese': 'queso',
    'egg': 'huevo',
    'eggs': 'huevos',
    'tomato': 'tomate',
    'onion': 'cebolla',
    'garlic': 'ajo',
    'potato': 'patata',
    'potatoes': 'patatas',
    'salad': 'ensalada',
    'soup': 'sopa',
    'sauce': 'salsa',
    'butter': 'mantequilla',
    'oil': 'aceite',
    'salt': 'sal',
    'pepper': 'pimienta',
    'sugar': 'azúcar',
    'flour': 'harina',
    'milk': 'leche',
    'water': 'agua',
    'breakfast': 'desayuno',
    'lunch': 'almuerzo',
    'dinner': 'cena',
    'snack': 'merienda',
  };

  // Buscar palabras comunes
  let textoTraducido = texto;
  Object.entries(traduccionesComunes).forEach(([en, es]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    textoTraducido = textoTraducido.replace(regex, es);
  });

  // Si el texto tiene muchas palabras en inglés, intentar traducir con API
  // Por ahora, retornamos el texto con traducciones manuales
  // En producción, podrías usar Google Translate API o similar
  return textoTraducido;
}

// Traducir título de receta
export function traducirTitulo(titulo: string): string {
  // Traducciones comunes de títulos de recetas
  const traduccionesTitulos: Record<string, string> = {
    'chicken': 'pollo',
    'beef': 'ternera',
    'pork': 'cerdo',
    'salmon': 'salmón',
    'pasta': 'pasta',
    'rice': 'arroz',
    'salad': 'ensalada',
    'soup': 'sopa',
    'sandwich': 'bocadillo',
    'pizza': 'pizza',
    'burger': 'hamburguesa',
    'soup': 'sopa',
    'stew': 'estofado',
    'roast': 'asado',
    'grilled': 'a la parrilla',
    'baked': 'al horno',
    'fried': 'frito',
    'steamed': 'al vapor',
    'with': 'con',
    'and': 'y',
    'or': 'o',
  };

  let tituloTraducido = titulo;
  Object.entries(traduccionesTitulos).forEach(([en, es]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    tituloTraducido = tituloTraducido.replace(regex, es);
  });

  return tituloTraducido;
}

// Traducir ingrediente
export function traducirIngrediente(ingrediente: string): string {
  return traducirTitulo(ingrediente); // Reutilizar la misma lógica
}

// Traducir tipo de dieta
export function traducirDieta(dieta: string): string {
  return traduccionesDietas[dieta.toLowerCase()] || dieta;
}

// Traducir tipo de plato
export function traducirTipoPlato(tipo: string): string {
  return traduccionesTiposPlato[tipo.toLowerCase()] || tipo;
}

// Traducir nutriente
export function traducirNutriente(nutriente: string): string {
  return traduccionesNutrientes[nutriente] || nutriente;
}

