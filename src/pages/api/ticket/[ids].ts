import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";

export const GET: APIRoute = async ({
  request,
  params,
}: {
  request: Request;
  params: Record<string, string | undefined>;
}) => {
  const { ids } = params;
  const url = new URL(request.url);
  const properties = url.searchParams.get("properties");
  const { data, error } = await supabase
    .from("ticket")
    .select(properties)
    .in("id", ids?.split(",") || []);

  console.log({ data, error });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ data, error }));
};
