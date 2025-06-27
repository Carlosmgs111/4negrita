import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";

export const GET: APIRoute = async () => {
  const { data: allTickets, error } = await supabase.from("ticket").select("*");
  if (error) {
    return Response.json({ error: error.message });
  }
  return Response.json(allTickets);
};
