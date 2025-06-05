import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const PATCH: APIRoute = async ({ request }) => {
  const { name, address, city, participantId } = await request.json();
  const { error: participantError, data: participant } = await supabase
    .from("participant")
    .update({
      fullName: name,
      address,
      city,
    })
    .eq("id", participantId)
    .single();
  console.log({ participant });
  const { data: updatedUser, error: userError } =
    await supabase.auth.updateUser({
      // phone: formData.phone,
    });

  if (participantError || userError) {
    return new Response(
      JSON.stringify({ error: participantError || userError })
    );
  }

  return new Response(JSON.stringify({ user: updatedUser.user }));
};
