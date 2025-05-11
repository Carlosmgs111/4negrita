
import type { CheckoutFormValues } from "@/components/PaymentForm";
import { useState } from "react";
import { useEffect } from "react";
import { useToast } from "./useToast";

export const useCheckout = () => {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedTickets = JSON.parse(params.get("tickets") || "[]")
    setSelectedTickets(selectedTickets);
    if (selectedTickets.length === 0) {
      toast({
        title: "Error",
        description: "No has seleccionado ningún boleto",
        variant: "destructive",
      });
    }
  }, []);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const totalAmount = selectedTickets.length * 10000; // $10.000 por boleto

  // Procesar el pago
  const onSubmit = async (data: CheckoutFormValues) => {
    setLoading(true);

    try {
      // Simulamos una petición a la pasarela de pago
      // Aquí iría la integración real con Wompi o PayU
      toast({
        title: "Procesando pago",
        description: "Tu pago está siendo procesado...",
      });

      // Simulamos un retardo para la integración con la pasarela
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Almacenar data en sessionStorage para recuperarla en la página de éxito
      sessionStorage.setItem(
        "paymentData",
        JSON.stringify({
          customerName: data.name,
          email: data.email,
          phone: data.phone,
          tickets: selectedTickets,
          amount: totalAmount,
          paymentMethod: data.paymentMethod,
        })
      );

      // Redirigir a la página de éxito
      // navigate("/payment-success");
    } catch (error) {
      toast({
        title: "Error en el pago",
        description:
          "Ocurrió un error al procesar tu pago. Por favor intenta nuevamente.",
        variant: "destructive",
      });
      console.error("Error de pago:", error);
    } finally {
      setLoading(false);
    }
  };
  return {
    onSubmit,
    loading,
    totalAmount,
    selectedTickets,
  };
};
