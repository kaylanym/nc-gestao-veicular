/* ═══════════════════════════════════════════════
   Configuração do Supabase — NC Gestão Veicular
   ═══════════════════════════════════════════════
   Preencha SUPABASE_ANON_KEY com sua chave pública.
   Encontre em: supabase.com → seu projeto → Settings → API → anon public
*/

var SUPABASE_URL      = 'https://pshabfkqjeyqxsebyhar.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaGFiZmtxamV5cXhzZWJ5aGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDg4NjQsImV4cCI6MjA4NzQyNDg2NH0.aEx_5AcYDVO9pqhm1l0dNXqs03D8zgqVeY0aoPiRPMc';

var _supabase = null;
try {
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true
    }
  });
} catch (e) {
  console.warn('[Supabase] Falha ao inicializar:', e.message);
}
