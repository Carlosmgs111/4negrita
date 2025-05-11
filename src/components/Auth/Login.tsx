import React from "react";
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

// Form validation schema
const loginFormSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "El teléfono debe tener al menos 10 dígitos" })
    .max(10, { message: "El teléfono debe tener máximo 10 dígitos" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginProps {
  onSwitchToRegister: () => void;
  supabase: any;
}

export const Login = ({ onSwitchToRegister, supabase }: LoginProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { toast } = useToast();

  // Initialize react-hook-form with zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Process the form
  const onSubmit = (data: LoginFormValues) => {
    // This is a mock login - in a real app, you would call an API
    console.log("Login attempt with:", data);

    // For demo purposes - in a real app, this would be from the API response
    const mockUserData = {
      id: "12345",
      phone: data.phone,
      name: "Usuario Demo",
    };

    // Store user data in localStorage (in a real app, you'd use a more secure approach)
    localStorage.setItem("user", JSON.stringify(mockUserData));

    toast({
      title: "Inicio de sesión exitoso",
      description: `Bienvenido de nuevo, ${mockUserData.name}`,
    });

    // Redirect to home page
    // window.location.href = "/";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de teléfono</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input placeholder="3001234567" {...field} type="tel" />
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
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-heart-500 hover:text-heart-600 font-medium"
          >
            Regístrate
          </button>
        </p>
      </form>
    </Form>
  );
};
