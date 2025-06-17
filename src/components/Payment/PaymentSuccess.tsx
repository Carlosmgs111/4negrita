import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, Ticket, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import ConfettiExplosion from "react-confetti-explosion";

interface PaymentData {
  customerName: string;
  email: string;
  phone: string;
  tickets: number[];
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  referenceCode?: string;
}

export const PaymentSuccess = ({
  transactionId,
  paymentMethod,
}: {
  transactionId: string;
  paymentMethod: string;
}) => {
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    // Recuperar datos del sessionStorage
    const storedData = sessionStorage.getItem("paymentData");

    if (!storedData) {
      window.location.href = "/tickets";
      return;
    }

    try {
      const data = JSON.parse(storedData) as PaymentData;
      setPaymentData(data);
    } catch (error) {
      console.error("Error parsing payment data", error);
      window.location.href = "/tickets";
    }
  }, []);

  const copyToClipboard = () => {
    if (!paymentData) return;

    const ticketInfo = `
Referencia de pago: ${paymentData.referenceCode || "No disponible"}
ID de transacción: ${
      paymentData.transactionId || transactionId || "No disponible"
    }
Boletos: ${paymentData.tickets.join(", ")}
Total: $${paymentData.amount.toLocaleString()}
    `;

    navigator.clipboard.writeText(ticketInfo);

    toast({
      title: "¡Copiado!",
      description:
        "La información de tus boletos ha sido copiada al portapapeles",
      duration: 3000,
    });
  };

  const handleShare = async () => {
    if (!paymentData) return;

    const shareText = `¡He comprado ${paymentData.tickets.length} boleto(s) para la rifa benéfica! 🎟️`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mis boletos para la rifa benéfica",
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.error("Error sharing", error);
      }
    } else {
      navigator.clipboard.writeText(shareText + " " + window.location.origin);
      toast({
        title: "¡Enlace copiado!",
        description: "Ahora puedes compartirlo con tus amigos",
        duration: 3000,
      });
    }
  };

  if (!paymentData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <ConfettiExplosion
        width={4000}
        height={"100vh"}
        particleCount={300}
        duration={5000}
        force={1}
      />
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center border-b pb-6">
            <div className="mx-auto bg-green-100 w-20 h-20 flex items-center justify-center rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              ¡Pago exitoso!
            </CardTitle>
            <CardDescription className="text-base">
              Tu compra ha sido procesada correctamente
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">
                Detalles de la compra:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {paymentData.referenceCode && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Referencia de pago
                    </p>
                    <p className="font-medium">{paymentData.referenceCode}</p>
                  </div>
                )}
                {(paymentData.transactionId || transactionId) && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      ID de Transacción
                    </p>
                    <p className="font-medium">
                      {paymentData.transactionId || transactionId}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Método de pago
                  </p>
                  <p className="font-medium">
                    {paymentMethod === "card"
                      ? "Tarjeta de crédito"
                      : paymentMethod === "nequi"
                      ? "Nequi"
                      : "PSE"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total pagado</p>
                  <p className="font-medium">
                    ${paymentData.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-lg">
                Boletos adquiridos:
              </h3>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                {paymentData.tickets.map((numero) => (
                  <Badge
                    key={numero}
                    className="bg-heart-500 text-white py-1.5 px-3"
                  >
                    <Ticket className="mr-1 h-3 w-3" />#
                    {(numero - 1).toString().padStart(3, "0")}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-green-800 text-sm">
                Se ha enviado un correo electrónico a{" "}
                <strong>{paymentData.email}</strong> con los detalles de tu
                compra. Guarda esta información para futuras referencias.
              </p>
            </div>

            <div className="pt-2 flex justify-center items-center">
              Powered by &nbsp;
              <img
                src="https://wompi.com/assets/downloadble/logos_wompi/Wompi_LogoPrincipal.svg"
                alt="Powered by Wompi"
                className="h-16"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1 sm:flex-none"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar información
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1 sm:flex-none"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            <Button
              asChild
              className="w-full mt-2 bg-heart-500 hover:bg-heart-600"
            >
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};
