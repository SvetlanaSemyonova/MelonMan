import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[MelonMan] Задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env (см. .env.example)."
  );
}

/** Клиент для браузера: только anon/publishable key, RLS в Supabase обязателен для таблиц. */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;
