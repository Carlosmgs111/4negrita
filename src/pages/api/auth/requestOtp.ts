import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phone } = body;
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: {
          fullName: "John Doe",
        },
      },
    });
    console.log(data, error);
    return new Response(JSON.stringify({ success: true, data, error }));
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ success: false, error }));
  }
};
