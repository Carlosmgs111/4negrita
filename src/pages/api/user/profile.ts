import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const PATCH: APIRoute = async ({ request }) => {
  const { name, address, city, participantId, email } = await request.json();
  const { error: participantError, data: participant } = await supabase
    .from("participant")
    .update({
      fullName: name,
      address,
      city,
    })
    .eq("id", participantId)
    .single();
  console.log(supabase.auth);
  const { data: updatedUser, error: userError } =
    await supabase.auth.updateUser({
      email,
      options: {
        emailRedirectTo: "http://localhost:4321/dashboard",
      },
    });
  console.log({ updatedUser, userError });
  if (participantError || userError) {
    return new Response(
      JSON.stringify({ error: participantError?.message || userError?.message }),
      {
        status: 300,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ user: updatedUser.user }));
};
