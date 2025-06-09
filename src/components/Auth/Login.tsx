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
import { authStore } from "@/stores/authStore";
import { URLManager } from "@/lib/URLManager";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultValues = {
    email: authStore.getState().email,
    password: "",
  };

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

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast({
          title: "Error al iniciar sesión",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      const { user, session, participant } = result.data;
      if (participant) {
        localStorage.setItem("participant", JSON.stringify(participant));
      }
      Object.entries(session).forEach(([key, value]) => {
        sessionStorage.setItem(key, JSON.stringify(value));
      });
      localStorage.setItem("user", JSON.stringify(user));
      authStore.setState({
        email: data.email,
      });
      sessionStorage.setItem("logged", "true");
      toast({
        title: "Ingreso exitoso",
        description: result.message,
      });
      authStore.setSerializedState(
        JSON.stringify({
          fullName: participant?.fullName,
          email: data.email,
          isLogged: true,
        })
      );
      const redirect = URLManager.getParam("redirect");
      window.location.href = redirect || "/";
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const authState = authStore.getSerializedState();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        authStore.setState({
                          email: e.target.value,
                        });
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
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="absolute right-3 top-3 text-gray-400 disabled:opacity-50"
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
          disabled={isLoading}
          className="w-full bg-heart-500 hover:bg-heart-600 disabled:opacity-50"
        >
          <LogIn className="mr-2" size={18} />
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        <p className="text-center text-sm">
          ¿No tienes una cuenta?&nbsp;
          <a
            href={`/auth/signup?auth=${authState}`}
            className="text-heart-500 hover:text-heart-600 font-medium"
          >
            Regístrate
          </a>
        </p>
      </form>
    </Form>
  );
};
