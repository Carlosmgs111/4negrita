import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { phone, token } = await request.json();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    
    type: "sms",
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
