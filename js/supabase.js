const SUPABASE_URL = 'https://nwxioucoddtrditemdwg.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eGlvdWNvZGR0cmRpdGVtZHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODQ5NDQsImV4cCI6MjA5NDg2MDk0NH0.WTQRPSH-qB7eWc3ZHamiNiMcgU7bg78jFG7qUXmC56w';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('Supabase conectado');