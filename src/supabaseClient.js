import { createClient } from '@supabase/supabase-js';

// Substitua com os dados que você acabou de copiar do seu painel do Supabase!
const supabaseUrl = 'https://hihhfjhxjxhovhzqpiua.supabase.co';
const supabaseAnonKey = 'sb_publishable_zRfZaBqu-kzKBfedI2jUGA_uC9estnp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);