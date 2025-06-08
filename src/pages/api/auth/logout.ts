import type { APIContext } from "astro";
import { supabase } from "../../../lib/supabase";

export const get = async ({}: APIContext) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }));
  }
  return new Response("OK");
};
