import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SECRET_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SECRET_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: import.meta.env.PUBLIC_SUPABASE_SCHEMA,
  },
});
