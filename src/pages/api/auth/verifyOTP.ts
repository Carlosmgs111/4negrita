import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { phone, token } = await request.json();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  console.log({ data, error });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { data: recoverdParticipant, error: participantError } = await supabase
    .from("participant")
    .select()
    .eq("userId", data.user.id)
    .single();
  if (!recoverdParticipant?.id) {
    const { data: participantData, error: participantError } = await supabase
      .from("participant")
      .insert({
        fullName: data.user.user_metadata.full_name.trim(),
        userId: data.user.id,
      })
      .single();

    if (participantError) {
      console.log({ participantError });
      return new Response(JSON.stringify({ error: participantError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
