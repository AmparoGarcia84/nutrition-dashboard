import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper para verificar conexión
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('pacientes').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

