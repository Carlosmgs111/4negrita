import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Shield, Smartphone } from "lucide-react";
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

export const OTPVerification = () => {
  const verifyPhoneSchema = z.object({
    otp: z
      .string()
      .min(6, { message: "El código debe tener 6 dígitos" })
      .max(6, { message: "El código debe tener 6 dígitos" }),
  });

  type VerifyPhoneValues = z.infer<typeof verifyPhoneSchema>;
  // Initialize react-hook-form with zod

  const [isResending, setIsResending] = useState(false);
  const [phoneNumber] = useState("+573194914913"); // Mock phone number - would come from props or state
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
        phone: phoneNumber,
        token: data.otp,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Verification response:", data);
        toast({
          title: "Verificación exitosa",
          description: "Tu número de teléfono ha sido verificado exitosamente",
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
  };

  const handleResendCode = async () => {
    setIsResending(true);

    // Mock resend - in real app, this would call Supabase/Twilio API
    setTimeout(() => {
      setIsResending(false);
      toast({
        title: "Código reenviado",
        description: "Se ha enviado un nuevo código a tu número telefónico",
      });
    }, 2000);
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
                  Código de Verificación
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

      <div className="mt-6 text-center">
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

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm text-center">
          <strong>Código de prueba:</strong> 123456
        </p>
      </div>
    </div>
  );
};
