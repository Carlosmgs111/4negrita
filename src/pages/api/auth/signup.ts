import type { APIRoute } from 'astro';
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { fullName, email, password, confirmPassword } = await request.json();

    // Validate input
    if (!fullName || !email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Todos los campos son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Las contraseñas no coinciden",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "La contraseña debe tener al menos 6 caracteres",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Por favor, ingresa un correo válido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate fullName length
    if (fullName.length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "El nombre debe tener al menos 3 caracteres",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Register with Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        channel: "email",
        data: {
          full_name: fullName.trim(),
        },
      },
    });

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

    // Check if user needs to verify email
    const needsVerification = !signUpData.user?.email_confirmed_at;

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
          ? `Registro exitoso. Por favor, verifica tu correo ${email}` 
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
}