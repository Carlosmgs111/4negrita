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
import { Eye, EyeOff, UserPlus, Phone, User, HelpCircle } from "lucide-react";
import { authStore } from "@/stores/authStore";
import { Tooltip } from "../Utilities/Tooltip";
import validMobilePrefix from "@/mocks/validMobilePrefix.json";
import testValidMobilePrefix from "@/mocks/testValidMobilePrefix.json";

const appMode = import.meta.env.PUBLIC_APP_MODE;

const validPrefix =
  appMode === "testing" ? testValidMobilePrefix : validMobilePrefix;
const phoneMessage =
  appMode === "testing"
    ? "Esta en modo de pruebas, por lo que el número no debe corresponder con un operador móvil real, deberia empezar con 377, 388 o 399"
    : "El número debe corresponder con un operador móvil válido";
// Form validation schema
const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
    phone: z
      .string()
      .min(10, { message: "Por favor, ingresa un teléfono válido" })
      .regex(/^3[0-9]{9}$/, {
        message:
          "Ingresa un número de celular válido (debe comenzar con 3 y tener 10 dígitos)",
      })
      .refine(
        (phone) => {
          const prefix = phone.substring(0, 3);
          return validPrefix.includes(prefix);
        },
        {
          message: phoneMessage,
        }
      ),
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultValues = {
    phone: authStore.getState().phone,
    fullName: authStore.getState().fullName,
    userId: authStore.getState().userId,
    password: "",
    confirmPassword: "",
  };

  useEffect(() => {
    authStore.setState({
      phone: defaultValues.phone,
      fullName: defaultValues.fullName,
      userId: defaultValues.userId,
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
    setIsLoading(true);
    if (
      appMode === "testing" &&
      data.password !== data.phone.substring(4, 10)
    ) {
      toast({
        title: "Error",
        description:
          "En modo prueba, la contraseña debe ser igual al codigo OTP (verificacion), el cual coincide con los ultimos 6 digitos del numero de telefono",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    try {
      const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
      if (userId) {
        toast({
          title: "Ya tienes una cuenta",
          description: "Por favor, inicia sesión",
          variant: "default",
        });
        window.location.href = "/auth/login";
        return;
      }
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast({
          title: "Error al registrar",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Success - handle client-side storage and state
      const { user, session, needsVerification } = result.data;

      // Update auth store
      authStore.setState({
        phone: data.phone,
        fullName: data.fullName,
      });

      // Store user data if session exists (email verified immediately)
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      console.log({ session });
      if (session) {
        Object.entries(session).forEach(([key, value]) => {
          sessionStorage.setItem(key, JSON.stringify(value));
        });
      }

      // Show success message
      toast({
        title: "Registro exitoso",
        description: result.message,
        variant: needsVerification ? "default" : "default",
      });

      // Redirect based on verification status
      if (needsVerification) {
        // Redirect to verification page or login
        window.location.href = "/auth/verify-phone?phone=" + data.phone;
      } else {
        // Redirect to home page
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                      disabled={isLoading}
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Tooltip
                      active={appMode === "testing"}
                      className="w-full"
                      allowHover
                      content={
                        <div className="flex flex-col text-xs p-2 gap-2 relative">
                          <p>
                            🤔¿No sabes que poner?, cualquier número que empiece
                            con{" "}
                            <b className="text-orange-500">
                              <i>377 284 70</i>
                            </b>
                            ,{" "}
                            <b className="text-cyan-500">
                              <i>388 593 60</i>
                            </b>{" "}
                            o{" "}
                            <b className="text-lime-500">
                              <i>399 174 20</i>
                            </b>
                            , y terminando con cualquier numero de{" "}
                            <b className="text-red-500">2 digitos</b>.
                          </p>

                          <div className="absolute top-0 right-[-5px]">
                            <Tooltip
                              distance={10}
                              position="right"
                              content="Haz click para saber más"
                            >
                              <a href="/guide/test-credentials#phone-number-composition">
                                <HelpCircle size={16} />
                              </a>
                            </Tooltip>
                          </div>
                        </div>
                      }
                    >
                      <Input
                        placeholder="3211234567"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          authStore.setState({ phone: e.target.value });
                        }}
                      />
                    </Tooltip>
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
                    <Tooltip
                      className="w-full"
                      content={
                        <div className="flex flex-col text-xs p-2 gap-2 relative">
                          <p>
                            ☝️ Recuerda que la contraseña debe ser igual al
                            codigo OTP (verificacion), el cual coincide con los
                            ultimos <b className="text-red-500">6 digitos</b>{" "}
                            del numero de telefono.
                          </p>
                          <p>
                            ej: <b className="text-cyan-500">3885936024</b> →{" "}
                            <b className="text-red-500">936024</b>
                          </p>{" "}
                          <div className="absolute top-0 right-[-5px]">
                            <Tooltip
                              distance={10}
                              position="right"
                              content="Haz click para saber más"
                            >
                              <a href="/guide/test-credentials#otp-codes">
                                <HelpCircle size={16} />
                              </a>
                            </Tooltip>
                          </div>
                        </div>
                      }
                      distance={10}
                      allowHover
                      active={appMode === "testing"}
                    >
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </Tooltip>
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Tooltip
                      className="w-full"
                      content={
                        <div className="flex flex-col text-xs p-2 gap-2 relative">
                          <p>
                            ☝️ Recuerda que la contraseña debe ser igual al
                            codigo OTP (verificacion), el cual coincide con los
                            ultimos <b className="text-red-500">6 digitos</b>{" "}
                            del numero de telefono.
                          </p>
                          <p>
                            ej: <b className="text-cyan-500">3885936024</b> →{" "}
                            <b className="text-red-500">936024</b>
                          </p>{" "}
                          <div className="absolute top-0 right-[-5px]">
                            <Tooltip
                              distance={10}
                              position="right"
                              content="Haz click para saber más"
                            >
                              <a href="/guide/test-credentials#otp-codes">
                                <HelpCircle size={16} />
                              </a>
                            </Tooltip>
                          </div>
                        </div>
                      }
                      distance={10}
                      allowHover
                      active={appMode === "testing"}
                    >
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </Tooltip>
                  </FormControl>
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={isLoading}
                    className="absolute right-3 top-3 text-gray-400 disabled:opacity-50"
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
          disabled={isLoading}
          className="w-full bg-heart-500 hover:bg-heart-600 disabled:opacity-50"
        >
          <UserPlus className="mr-2" size={18} />
          {isLoading ? "Registrando..." : "Registrarse"}
        </Button>

        <p className="text-center text-sm">
          ¿Ya tienes una cuenta?&nbsp;
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
