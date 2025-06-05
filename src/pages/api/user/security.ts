import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const PATCH: APIRoute = async ({ request }) => {
  const { password } = await request.json();
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error }));
  }
  return new Response(JSON.stringify({ user: data.user }));
};
