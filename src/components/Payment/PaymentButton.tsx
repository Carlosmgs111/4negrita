import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { LoaderCircle } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";

interface WompiPaymentButtonProps {
  disabled?: boolean;
  amount: number;
  customerData: {
    name: string;
    email: string;
    phone: string;
    documentType: string;
    document: number;
  };
  paymentMethod: string;
  reference: string;
  ticketIds: number[];
  onPaymentSuccess: () => void;
  onPaymentError: () => void;
}

export const PaymentButton = ({
  disabled,
  amount,
  customerData,
  paymentMethod,
  reference,
  ticketIds,
  onPaymentSuccess,
  onPaymentError,
}: WompiPaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Store ticket information in sessionStorage to retrieve after payment
      const paymentInfo = {
        customerName: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        tickets: ticketIds,
        amount: amount,
        paymentMethod: paymentMethod,
        reference: reference,
      };

      sessionStorage.setItem("pendingPaymentData", JSON.stringify(paymentInfo));

      toast({
        title: "Conectando con Wompi",
        description: "Preparando la pasarela de pago...",
      });

      // Get the current URL to build redirect URLs
      const currentOrigin = window.location.origin;
      const successUrl = `${currentOrigin}/payment/success?reference=${reference}`;

      // Create Wompi payment
      const paymentData = await usePayment(
        amount,
        reference,
        customerData.email,
        customerData.name,
        customerData.phone,
        successUrl
      );

      // Redirect to Wompi payment page
      window.location.href = paymentData.payment_url;
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      toast({
        title: "Error en el pago",
        description:
          "Ocurrió un error al procesar tu pago con Wompi. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      onPaymentError();
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || disabled}
      className="w-full bg-heart-500 hover:bg-heart-600 text-white"
    >
      {loading ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Conectando con Wompi...
        </>
      ) : (
        `Pagar $${amount.toLocaleString()} con Wompi`
      )}
    </Button>
  );
};
