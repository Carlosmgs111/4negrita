import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { phone, password } = await request.json();

    // Validate input
    if (!phone || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email y contraseña son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate with Supabase
    const formatedPhone = `+57${phone}`;
    console.log({ formatedPhone, password });
    const {
      data: { session, user },
      error: authError,
    } = await supabase.auth.signInWithPassword({
      phone: formatedPhone,
      password,
    });

    if (authError) {
      console.error("Login error:", authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: authError.message,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get participant data
    const { data: participant, error: participantError } = await supabase
      .from("participant")
      .select()
      .eq("userId", user.id)
      .single();

    if (participantError) {
      console.warn("Error fetching participant:", participantError.message);
    }

    // Return success response with user data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user,
          session,
          participant: participant || null,
        },
        message: `Bienvenido, ${phone}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
