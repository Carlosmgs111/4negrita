import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowLeft,
  RefreshCw,
  Shield,
  Smartphone,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/useToast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { authStore } from "@/stores/authStore";

export const OTPVerification = ({ phone }: { phone: string | null }) => {
  const verifyPhoneSchema = z.object({
    otp: z
      .string()
      .min(6, { message: "El código debe tener 6 dígitos" })
      .max(6, { message: "El código debe tener 6 dígitos" }),
  });

  type VerifyPhoneValues = z.infer<typeof verifyPhoneSchema>;
  // Initialize react-hook-form with zod

  const [isResending, setIsResending] = useState(false);
  const formatedPhone = "+57" + phone; // Mock phone number - would come from props or state
  const form = useForm<VerifyPhoneValues>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      otp: "",
    },
  });
  const onSubmit = (data: VerifyPhoneValues) => {
    console.log("Verifying OTP:", data.otp);
    fetch("/api/auth/verifyOTP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: formatedPhone,
        token: data.otp,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Verification response:", data);
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Verificación exitosa",
          description: "Tu número de teléfono ha sido verificado exitosamente",
          variant: "default",
        });
        if (data.session) {
          Object.entries(data.session).forEach(([key, value]) => {
            sessionStorage.setItem(key, JSON.stringify(value));
          });
          sessionStorage.setItem("access_token", data.session.access_token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        if (data.participant) {
          localStorage.setItem("participant", JSON.stringify(data.participant));
        }
        sessionStorage.setItem("isLogged", "true");
        authStore.setState({
          phone: formatedPhone,
          fullName: data.user?.full_name,
          isLogged: true,
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      })
      .catch((error) => {
        console.error("Verification error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleResendCode = async () => {
    setIsResending(true);
    fetch("/api/auth/requestOtp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: formatedPhone,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Verification response:", data);
        toast({
          title: "Código reenviado",
          description: "Se ha enviado un nuevo código a tu número telefónico",
          variant: "default",
        });
      })
      .catch((error) => {
        console.error("Verification error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
    setTimeout(() => {
      setIsResending(false);
    }, 1000);
  };
  const { toast } = useToast();

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center block">
                  Introduce Aquí
                  <ArrowDown size={16} className="inline mx-1" />
                  el Código de Verificación
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-heart-500 hover:bg-heart-600 transition-all duration-300"
          >
            <Shield className="mr-2" size={18} />
            Verificar Código
          </Button>
        </form>
      </Form>
      <Separator className="my-6 w-full h-px bg-gray-200" />
      <div className="mt-6 text-center mb-6">
        <p className="text-sm text-gray-600 mb-3">¿No recibiste el código?</p>
        <Button
          variant="outline"
          onClick={handleResendCode}
          disabled={isResending}
          className="border-heart-300 text-heart-600 hover:heart-600 transition-all duration-300"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Reenviando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reenviar código
            </>
          )}
        </Button>
      </div>
      <span className="text-center block text-xs text-gray-500 pb-2">
        Se ha enviado un codigo de verificacion por SMS a tu numero de telefono,
        ingresa el codigo para verificar tu numero de telefono.
      </span>
      <span className="text-center block text-xs text-gray-500">
        Debe tener un formato similar a este:
      </span>
      <div className="mt-2 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
        <p className="text-yellow-800 text-sm text-center">
          <strong>Código de muestra:</strong> 123456
        </p>
      </div>
    </div>
  );
};
