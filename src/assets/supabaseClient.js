import { createClient } from '@supabase/supabase-js';

// Substitua com os dados que você acabou de copiar do seu painel do Supabase!
const supabaseUrl = 'COLE_AQUI_O_SEU_PROJECT_URL';
const supabaseAnonKey = 'COLE_AQUI_A_SUA_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);