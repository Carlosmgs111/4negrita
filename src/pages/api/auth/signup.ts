import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

const validateData = (data: any) => {
  const errors: string[] = [];
  if (!data.fullName) errors.push("Nombre es requerido");
  if (!data.phone) errors.push("Teléfono es requerido");
  if (!data.password) errors.push("Contraseña es requerida");
  if (!data.confirmPassword) errors.push("Confirmar contraseña es requerida");
  if (data.password !== data.confirmPassword)
    errors.push("Las contraseñas no coinciden");
  if (data.password.length < 6)
    errors.push("La contraseña debe tener al menos 6 caracteres");
  if (!data.phone.match(/^\d{10}$/))
    errors.push("Por favor, ingresa un teléfono válido");
  if (data.fullName.length < 3)
    errors.push("El nombre debe tener al menos 3 caracteres");
  return errors;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { fullName, phone, password, confirmPassword } = await request.json();
    // Validate input
    const errors = validateData({ fullName, phone, password, confirmPassword });
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const formatedPhone = `+57${phone}`;
    // Register with Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        phone: formatedPhone,
        password,
        options: {
          channel: "sms",
          data: {
            full_name: fullName.trim(),
          },
        },
      }
    );
    console.log(signUpData, signUpError);
    if (signUpError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: signUpError.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: participantData, error: participantError } = await supabase
      .from("participant")
      .insert({
        fullName: fullName.trim(),
        userId: signUpData.user.id,
      })
      .single();

    if (participantError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: participantError.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user needs to verify phone
    const needsVerification = !signUpData.user?.phone_confirmed_at;

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: signUpData.user,
          session: signUpData.session,
          needsVerification,
        },
        message: needsVerification
          ? `Registro exitoso. Por favor, verifica tu teléfono ${phone}`
          : `Bienvenido, ${fullName}`,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
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
