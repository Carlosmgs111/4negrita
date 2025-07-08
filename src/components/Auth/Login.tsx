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
import { HelpCircle, Eye, EyeOff, LogIn, Phone, UserPlus } from "lucide-react";
import { authStore } from "@/stores/authStore";
import { URLManager } from "@/lib/URLManager";
import { Tooltip } from "../Utilities/Tooltip";
import validMobilePrefix from "@/mocks/validMobilePrefix.json";
import testValidMobilePrefix from "@/mocks/testValidMobilePrefix.json";

const appMode = import.meta.env.PUBLIC_APP_MODE;

const validPrefix =
  appMode === "testing"
    ? testValidMobilePrefix
    : validMobilePrefix;
const phoneMessage =
  appMode === "testing"
    ? "Esta en modo de pruebas, por lo que el número no debe corresponder con un operador móvil real, deberia empezar con 377, 388 o 399"
    : "El número debe corresponder con un operador móvil válido";

const loginFormSchema = z.object({
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
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast, dismiss } = useToast();

  const defaultValues = {
    phone: authStore.getState().phone,
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
    authStore.setState({ phone: defaultValues.phone });
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
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.log({ error: result.error });
        const phoneComfirmationRequired = result.code === "phone_not_confirmed";
        toast({
          title: "Error al iniciar sesión",
          description: result.error,
          variant: "destructive",
          className: "flex flex-col gap-2 items-start",
          action: (
            <a
              href={
                phoneComfirmationRequired
                  ? "/auth/verify-phone?phone=" + data.phone
                  : "/auth/signup"
              }
              onClick={() => {
                if (phoneComfirmationRequired) {
                  const phone = "+57" + data.phone;
                  fetch("/api/auth/requestOtp", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      phone,
                    }),
                  });
                }
                dismiss();
              }}
              className="bg-white text-heart-500 px-4 py-2 rounded-md !m-0 w-full text-center flex items-center justify-center"
            >
              {phoneComfirmationRequired ? (
                <Phone className="mr-2" size={16} />
              ) : (
                <UserPlus className="mr-2" size={16} />
              )}
              {phoneComfirmationRequired ? "Verificar teléfono" : "Registrarte"}
            </a>
          ),
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
      sessionStorage.setItem("isLogged", "true");
      authStore.setState({
        phone: data.phone,
      });
      toast({
        title: "Ingreso exitoso",
        description: result.message,
      });
      authStore.setSerializedState(
        JSON.stringify({
          fullName: participant?.fullName,
          phone: data.phone,
          isLogged: true,
          userId: user.id,
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Tooltip
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
                            , terminando con cualquier numero de 2 digitos
                          </p>

                          <div className="absolute top-0 right-[-5px]">
                            <Tooltip
                              distance={10}
                              position="right"
                              content="Haz click para saber más"
                            >
                              <a href="/guide/test-credentials">
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
                          authStore.setState({
                            phone: e.target.value,
                          });
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
