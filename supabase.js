// ── supabase.js ───────────────────────────────────────────────────────────
// Supabase client — loaded before app.js

const SUPABASE_URL = "https://ljrdxacphmquwxllvayn.supabase.co";
const SUPABASE_KEY = "sb_publishable_mFsZmj8cn6o3GRZfe2SObA_YEvFF4yS";

// `db` is used by app.js for all data operations once Supabase is wired in.
// For now the app still uses localStorage — app.js update is the next step.
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
