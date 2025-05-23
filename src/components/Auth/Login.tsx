import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Eye, EyeOff, LogIn, Phone } from "lucide-react";
import { stateManager } from "@/stores/stores";
import { supabase } from "@/lib/supabase";
import { authStore } from "@/stores/authStore";

// Form validation schema
const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const defaultValues = {
  email: authStore.getState().email || "carlosmgs111@outlook.com",
  password: "123456",
};

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const raffles = stateManager.getState().raffles;

  console.log("raffles", raffles);

  // Initialize react-hook-form with zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    authStore.setState({ email: defaultValues.email });
  }, []);

  // Process the form
  const onSubmit = async (data: LoginFormValues) => {
    // This is a mock login - in a real app, you would call an API
    console.log("Login attempt with:", data);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email, // asegúrate de formatearlo bien
      password: data.password,
      options: {
        channel: "email",
      },
    });

    if (error) {
      toast({
        title: "Error al registrar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registro exitoso",
      description: "Revisa tu correo para continuar.",
    });

    console.log("signUpData", signUpData);
    // Redirect to home page
    // window.location.href = "/";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <p>{JSON.stringify(raffles)}</p>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <div className="relative">
                  <FormControl >
                    <Input
                      placeholder="example@email.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e); // Update react-hook-form's state
                        authStore.setState({ email: e.target.value }); // Call your custom onChange handler
                      }}
                    />
                  </FormControl>
                  <Phone
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-heart-500 hover:bg-heart-600"
        >
          <LogIn className="mr-2" size={18} />
          Iniciar sesión
        </Button>

        <p className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <a
            href="/auth/signup"
            className="text-heart-500 hover:text-heart-600 font-medium"
          >
            Regístrate
          </a>
        </p>
      </form>
    </Form>
  );
};
