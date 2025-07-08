import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { phone, token } = await request.json();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  let participant;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { data: recoverdParticipant } = await supabase
    .from("participant")
    .select()
    .eq("userId", data.user.id)
    .single();
  if (!recoverdParticipant) {
    const { error: participantError } = await supabase
      .from("participant")
      .insert({
        fullName: data.user.user_metadata.full_name.trim(),
        userId: data.user.id,
      })
      .single();
    if (participantError) {
      return new Response(JSON.stringify({ error: participantError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return new Response(
    JSON.stringify({
      ...data,
      participant: {
        fullName: data.user.user_metadata.full_name.trim(),
        userId: data.user.id,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
