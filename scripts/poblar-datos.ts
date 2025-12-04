/**
 * Script para poblar la base de datos con 5 pacientes completos
 * Ejecutar con: npx tsx scripts/poblar-datos.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
const envPath = resolve(process.cwd(), '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
} catch (error) {
  console.error('⚠️  No se pudo cargar .env.local, usando variables de entorno del sistema');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Generar DNIs únicos
const timestamp = Date.now();
const pacientesData = [
  {
    nombre: 'María García López',
    dni: `${timestamp}1A`,
    telefono: '612345678',
    fecha_nacimiento: '1985-03-15',
    email: 'maria.garcia@email.com',
    direccion: 'Calle Mayor 123',
    codigo_postal: '28001',
    localidad: 'Madrid',
    grupos_alimentarios: ['Harinas', 'Frutas', 'Carne Blanca', 'Pescado Blanco', 'Lácteos'],
    ingestas: {
      desayuno: true,
      almuerzo: true,
      comida: true,
      merienda: true,
      cena: true,
      horario: '08:00, 11:00, 14:00, 17:00, 21:00',
      que: 'Cereales, fruta, verdura, proteína'
    },
    recomendado_por: 'Amiga',
    agua_diaria: '2 litros',
    otros_liquidos: 'Té verde, infusiones',
    habitos_alimenticios: 'Regulares pero mejorables',
    cansancio_dia: 'Por las tardes',
    problemas_digestion: 'Ocasionales después de comer',
    peso_ideal: '65 kg',
    deporte: {
      practica: true,
      cual: 'Yoga y caminar',
      frecuencia: '3 veces por semana'
    },
    calidad_sueno: 'Regular, se despierta 1-2 veces',
    dieta_anterior: 'Dieta mediterránea',
    estado_salud: 'Buena en general',
    dolencias: ['Colesterol alto', 'Retención de líquidos'],
    medicamentos: [
      { farmaco: 'Atorvastatina', dosis: '20mg', motivo: 'Colesterol', tiempo: '6 meses' }
    ],
    trabajo: {
      trabaja: true,
      tipo: 'Oficina administrativa',
      horario: '9:00-18:00'
    },
    estres: {
      nivel: 6,
      motivo: 'Trabajo y familia',
      afecta_salud: true
    },
    activo: true
  },
  {
    nombre: 'Juan Martínez Ruiz',
    dni: `${timestamp}2B`,
    telefono: '623456789',
    fecha_nacimiento: '1990-07-22',
    email: 'juan.martinez@email.com',
    direccion: 'Avenida de la Paz 45',
    codigo_postal: '41001',
    localidad: 'Sevilla',
    grupos_alimentarios: ['Carne Roja', 'Pescado Azul', 'Frutos secos', 'Legumbres', 'Quesos'],
    ingestas: {
      desayuno: true,
      almuerzo: false,
      comida: true,
      merienda: true,
      cena: true,
      horario: '07:30, 14:30, 18:00, 22:00',
      que: 'Proteínas, carbohidratos complejos'
    },
    recomendado_por: 'Médico de cabecera',
    agua_diaria: '3 litros',
    otros_liquidos: 'Agua con limón',
    habitos_alimenticios: 'Irregulares, come fuera mucho',
    cansancio_dia: 'Por las mañanas',
    problemas_digestion: 'Acidez después de comidas copiosas',
    peso_ideal: '80 kg',
    deporte: {
      practica: true,
      cual: 'Gimnasio y running',
      frecuencia: '5 veces por semana'
    },
    calidad_sueno: 'Bueno, duerme 7-8 horas',
    dieta_anterior: 'Dieta alta en proteínas',
    estado_salud: 'Muy buena',
    dolencias: ['Tensión arterial alta'],
    medicamentos: [
      { farmaco: 'Enalapril', dosis: '10mg', motivo: 'Hipertensión', tiempo: '1 año' }
    ],
    trabajo: {
      trabaja: true,
      tipo: 'Autónomo - Consultoría',
      horario: 'Flexible'
    },
    estres: {
      nivel: 7,
      motivo: 'Trabajo y responsabilidades',
      afecta_salud: true
    },
    activo: true
  },
  {
    nombre: 'Ana Fernández Sánchez',
    dni: `${timestamp}3C`,
    telefono: '634567890',
    fecha_nacimiento: '1992-11-08',
    email: 'ana.fernandez@email.com',
    direccion: 'Plaza del Sol 8, 2ºB',
    codigo_postal: '08001',
    localidad: 'Barcelona',
    grupos_alimentarios: ['Frutas', 'Pescado Blanco', 'Marisco', 'Féculas', 'Semillas'],
    ingestas: {
      desayuno: true,
      almuerzo: true,
      comida: true,
      merienda: false,
      cena: true,
      horario: '08:30, 12:00, 15:00, 21:30',
      que: 'Pescado, verduras, frutas, cereales integrales'
    },
    recomendado_por: 'Nutricionista anterior',
    agua_diaria: '2.5 litros',
    otros_liquidos: 'Tés, caldos',
    habitos_alimenticios: 'Muy buenos, cocina en casa',
    cansancio_dia: 'No',
    problemas_digestion: 'No',
    peso_ideal: '58 kg',
    deporte: {
      practica: true,
      cual: 'Natación y pilates',
      frecuencia: '4 veces por semana'
    },
    calidad_sueno: 'Excelente, duerme 8 horas seguidas',
    dieta_anterior: 'Dieta vegetariana',
    estado_salud: 'Excelente',
    dolencias: [],
    medicamentos: [],
    trabajo: {
      trabaja: true,
      tipo: 'Diseñadora gráfica',
      horario: '10:00-19:00'
    },
    estres: {
      nivel: 3,
      motivo: 'Ocasional por plazos',
      afecta_salud: false
    },
    activo: true
  },
  {
    nombre: 'Carlos Rodríguez Pérez',
    dni: `${timestamp}4D`,
    telefono: '645678901',
    fecha_nacimiento: '1978-05-30',
    email: 'carlos.rodriguez@email.com',
    direccion: 'Calle San Juan 67',
    codigo_postal: '29001',
    localidad: 'Málaga',
    grupos_alimentarios: ['Harinas', 'Carne Blanca', 'Pescado Blanco', 'Legumbres', 'Lácteos'],
    ingestas: {
      desayuno: true,
      almuerzo: false,
      comida: true,
      merienda: false,
      cena: true,
      horario: '09:00, 15:00, 22:00',
      que: 'Comida tradicional mediterránea'
    },
    recomendado_por: 'Endocrino',
    agua_diaria: '1.5 litros',
    otros_liquidos: 'Café, cerveza ocasional',
    habitos_alimenticios: 'Malos, come rápido y fuera',
    cansancio_dia: 'Sí, después de comer',
    problemas_digestion: 'Sí, pesadez y gases',
    peso_ideal: '75 kg',
    deporte: {
      practica: false,
      cual: '',
      frecuencia: ''
    },
    calidad_sueno: 'Malo, ronca y se despierta',
    dieta_anterior: 'Sin dieta específica',
    estado_salud: 'Regular',
    dolencias: ['Diabetes tipo 2', 'Colesterol alto', 'Tensión arterial'],
    medicamentos: [
      { farmaco: 'Metformina', dosis: '850mg', motivo: 'Diabetes', tiempo: '2 años' },
      { farmaco: 'Simvastatina', dosis: '20mg', motivo: 'Colesterol', tiempo: '1 año' }
    ],
    trabajo: {
      trabaja: true,
      tipo: 'Comercial',
      horario: '8:00-20:00'
    },
    estres: {
      nivel: 8,
      motivo: 'Trabajo, familia, salud',
      afecta_salud: true
    },
    activo: true
  },
  {
    nombre: 'Laura Torres Jiménez',
    dni: `${timestamp}5E`,
    telefono: '656789012',
    fecha_nacimiento: '1995-09-14',
    email: 'laura.torres@email.com',
    direccion: 'Calle Gran Vía 234',
    codigo_postal: '46001',
    localidad: 'Valencia',
    grupos_alimentarios: ['Frutas', 'Pescado Azul', 'Frutos secos', 'Quesos', 'Tés'],
    ingestas: {
      desayuno: true,
      almuerzo: true,
      comida: true,
      merienda: true,
      cena: true,
      horario: '08:00, 11:30, 14:00, 17:30, 21:00',
      que: 'Dieta variada y equilibrada'
    },
    recomendado_por: 'Instagram',
    agua_diaria: '2 litros',
    otros_liquidos: 'Tés, zumos naturales',
    habitos_alimenticios: 'Buenos, intenta comer sano',
    cansancio_dia: 'A veces por las tardes',
    problemas_digestion: 'Ocasionales',
    peso_ideal: '60 kg',
    deporte: {
      practica: true,
      cual: 'Ciclismo y baile',
      frecuencia: '3-4 veces por semana'
    },
    calidad_sueno: 'Bueno',
    dieta_anterior: 'Dieta flexitariana',
    estado_salud: 'Buena',
    dolencias: ['Anemia'],
    medicamentos: [
      { farmaco: 'Hierro', dosis: '100mg', motivo: 'Anemia', tiempo: '3 meses' }
    ],
    trabajo: {
      trabaja: true,
      tipo: 'Profesora de primaria',
      horario: '9:00-17:00'
    },
    estres: {
      nivel: 5,
      motivo: 'Trabajo con niños',
      afecta_salud: false
    },
    activo: true
  }
];

// Función para generar medidas completas
function generarMedidas(pacienteId: string, fechaBase: Date, pesoBase: number, altura: number) {
  const medidas = [];
  
  // Generar 3-5 medidas en los últimos 6 meses
  const numMedidas = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numMedidas; i++) {
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() - (numMedidas - i - 1) * 2);
    
    // Variación de peso (±2kg)
    const peso = pesoBase + (Math.random() * 4 - 2);
    const imc = Number((peso / ((altura / 100) ** 2)).toFixed(1));
    
    const bioimpedancia = {
      altura,
      peso: Number(peso.toFixed(1)),
      grasaSubcutanea: Number((15 + Math.random() * 15).toFixed(1)),
      huesos: Number((peso * 0.15).toFixed(1)),
      agua: Number((50 + Math.random() * 10).toFixed(1)),
      musculo: Number((peso * 0.4).toFixed(1)),
      metabolismoBasal: Math.round(1800 + Math.random() * 400),
      edadMetabolica: 30 + Math.floor(Math.random() * 20),
      grasaVisceral: Math.round(5 + Math.random() * 10),
      azucarSangre: Math.round(80 + Math.random() * 20),
      tension: `${Math.round(110 + Math.random() * 20)}/${Math.round(70 + Math.random() * 15)}`,
      flexibilidad: Math.round(20 + Math.random() * 30),
      phSaliva: Number((6.5 + Math.random() * 1.5).toFixed(1)),
      imc
    };
    
    const segmental = {
      brazoIzq: {
        kg: Number((peso * 0.05).toFixed(1)),
        porcentaje: Number((bioimpedancia.grasaSubcutanea + Math.random() * 5).toFixed(1))
      },
      brazoDer: {
        kg: Number((peso * 0.05).toFixed(1)),
        porcentaje: Number((bioimpedancia.grasaSubcutanea + Math.random() * 5).toFixed(1))
      },
      tronco: {
        kg: Number((peso * 0.45).toFixed(1)),
        porcentaje: Number((bioimpedancia.grasaSubcutanea + Math.random() * 3).toFixed(1))
      },
      piernaIzq: {
        kg: Number((peso * 0.225).toFixed(1)),
        porcentaje: Number((bioimpedancia.grasaSubcutanea + Math.random() * 5).toFixed(1))
      },
      piernaDer: {
        kg: Number((peso * 0.225).toFixed(1)),
        porcentaje: Number((bioimpedancia.grasaSubcutanea + Math.random() * 5).toFixed(1))
      }
    };
    
    const plicometria = {
      bicipital: Number((5 + Math.random() * 10).toFixed(1)),
      tricipital: Number((8 + Math.random() * 15).toFixed(1)),
      subEscapular: Number((10 + Math.random() * 15).toFixed(1)),
      abdominal: Number((12 + Math.random() * 20).toFixed(1)),
      suprailiaco: Number((10 + Math.random() * 18).toFixed(1)),
      muslo: Number((15 + Math.random() * 20).toFixed(1)),
      gemelo: Number((5 + Math.random() * 8).toFixed(1))
    };
    
    const antropometria = {
      hombro: Number((100 + Math.random() * 20).toFixed(1)),
      biceps: Number((28 + Math.random() * 8).toFixed(1)),
      bicepsContraido: Number((30 + Math.random() * 8).toFixed(1)),
      pecho: Number((90 + Math.random() * 15).toFixed(1)),
      cintura: Number((75 + Math.random() * 15).toFixed(1)),
      ombligo: Number((80 + Math.random() * 15).toFixed(1)),
      cadera: Number((95 + Math.random() * 15).toFixed(1)),
      muneca: Number((16 + Math.random() * 2).toFixed(1)),
      gluteos: Number((95 + Math.random() * 15).toFixed(1)),
      cuadriceps: Number((55 + Math.random() * 10).toFixed(1)),
      gemelo: Number((35 + Math.random() * 8).toFixed(1)),
      tobillo: Number((22 + Math.random() * 3).toFixed(1))
    };
    
    const hora = `${String(9 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    
    medidas.push({
      paciente_id: pacienteId,
      fecha: fecha.toISOString().split('T')[0],
      hora,
      bioimpedancia,
      segmental,
      plicometria,
      antropometria,
      notas: i === numMedidas - 1 ? 'Última medida de control' : null
    });
  }
  
  return medidas;
}

// Función para generar biomarcadores
function generarBiomarcadores(pacienteId: string) {
  const tipos = [
    'gastrointestinal',
    'biorritmo',
    'osteoarticular',
    'datosCliniclos', // Nota: hay un typo en el schema, debería ser 'datosClinicos'
    'estetica',
    'psiconutricion',
    'rendimientoDeportivo',
    'hormonas',
    'sistemaInmune',
    'microbiota'
  ];
  
  const biomarcadores = tipos.map((tipo, index) => {
    const porcentaje = Math.round(40 + Math.random() * 50);
    const numTareas = Math.floor(Math.random() * 5) + 2;
    
    const tareas = Array.from({ length: numTareas }, (_, i) => ({
      id: `${Date.now()}-${index}-${i}`,
      descripcion: `Tarea ${i + 1} para mejorar ${tipo}`,
      completada: Math.random() > 0.7
    }));
    
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 90));
    
    return {
      paciente_id: pacienteId,
      tipo,
      porcentaje,
      fecha: fecha.toISOString().split('T')[0],
      notas: porcentaje < 60 ? `Requiere atención especial en ${tipo}` : `Estado favorable en ${tipo}`,
      tareas
    };
  });
  
  return biomarcadores;
}

async function poblarDatos() {
  console.log('🚀 Iniciando población de datos...\n');
  
  try {
    // Insertar pacientes
    const pacientesIds: string[] = [];
    
    for (let i = 0; i < pacientesData.length; i++) {
      const paciente = pacientesData[i];
      console.log(`📝 Insertando paciente ${i + 1}/5: ${paciente.nombre}...`);
      
      const { data: pacienteInsertado, error: errorPaciente } = await supabase
        .from('pacientes')
        .insert(paciente)
        .select()
        .single();
      
      if (errorPaciente) {
        console.error(`❌ Error al insertar paciente ${paciente.nombre}:`, errorPaciente);
        continue;
      }
      
      pacientesIds.push(pacienteInsertado.id);
      console.log(`✅ Paciente insertado: ${pacienteInsertado.id}\n`);
      
      // Generar y insertar medidas
      const pesoBase = i === 0 ? 70 : i === 1 ? 85 : i === 2 ? 62 : i === 3 ? 90 : 65;
      const altura = i === 0 ? 165 : i === 1 ? 180 : i === 2 ? 160 : i === 3 ? 175 : 168;
      const medidas = generarMedidas(pacienteInsertado.id, new Date(), pesoBase, altura);
      
      console.log(`  📊 Insertando ${medidas.length} medidas...`);
      const { error: errorMedidas } = await supabase
        .from('medidas')
        .insert(medidas);
      
      if (errorMedidas) {
        console.error(`  ⚠️  Error al insertar medidas:`, errorMedidas);
      } else {
        console.log(`  ✅ ${medidas.length} medidas insertadas`);
      }
      
      // Generar y insertar biomarcadores
      const biomarcadores = generarBiomarcadores(pacienteInsertado.id);
      
      console.log(`  🧬 Insertando ${biomarcadores.length} biomarcadores...`);
      const { error: errorBiomarcadores } = await supabase
        .from('biomarcadores')
        .insert(biomarcadores);
      
      if (errorBiomarcadores) {
        console.error(`  ⚠️  Error al insertar biomarcadores:`, errorBiomarcadores);
      } else {
        console.log(`  ✅ ${biomarcadores.length} biomarcadores insertados`);
      }
      
      console.log('');
    }
    
    console.log('✨ ¡Población de datos completada!\n');
    console.log(`📊 Resumen:`);
    console.log(`   - ${pacientesIds.length} pacientes insertados`);
    console.log(`   - ${pacientesIds.length * 4} medidas aprox. insertadas`);
    console.log(`   - ${pacientesIds.length * 10} biomarcadores insertados`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Ejecutar
poblarDatos();

