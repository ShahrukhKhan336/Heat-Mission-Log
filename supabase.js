// ── supabase.js ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ljrdxacphmquwxllvayn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcmR4YWNwaG1xdXd4bGx2YXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjY3MDUsImV4cCI6MjEwMzM0MjcwNX0.U199rwR_6G-6xuh5IvjA6_9cO-y6hx1ZzY-Mn2gN9KI";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
