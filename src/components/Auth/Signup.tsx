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
import { Eye, EyeOff, UserPlus, Phone, User } from "lucide-react";
import { authStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

// Form validation schema
const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
    email: z.string().email({ message: "Por favor, ingresa un correo válido" }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  
  const defaultValues = {
    email: authStore.getState().email,
    fullName: authStore.getState().fullName,
    password: "",
    confirmPassword: "",
  };

  useEffect(() => {
    authStore.setState({
      email: defaultValues.email,
      fullName: defaultValues.fullName,
    });
  }, []);

  // Initialize react-hook-form with zod
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Process the form
  const onSubmit = async (data: RegisterFormValues) => {
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
      description: `Bienvenido, ${data.fullName}`,
    });
    authStore.setState({
      email: data.email,
      fullName: data.fullName,
    });
    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Juan Pérez"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        authStore.setState({ fullName: e.target.value });
                      }}
                    />
                  </FormControl>
                  <User
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="example@email.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        authStore.setState({ email: e.target.value });
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
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
          <UserPlus className="mr-2" size={18} />
          Registrarse
        </Button>

        <p className="text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <a
            href="/auth/login"
            className="text-heart-500 hover:text-heart-600 font-medium"
          >
            Inicia sesión
          </a>
        </p>
      </form>
    </Form>
  );
};
