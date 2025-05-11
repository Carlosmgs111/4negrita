import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import { PaymentForm } from "./PaymentForm";
import { useCheckout } from "@/hooks/useCheckout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const CheckoutStep = () => {
  const { onSubmit, loading, totalAmount, selectedTickets } = useCheckout();

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2 text-heart-600">
            Finaliza tu compra
          </h1>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/tickets")}
            className="pt-2 pb-2 pl-4 pr-6 text-1xl"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">
          Completa la información para procesar tu pago
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de pago</CardTitle>
                <CardDescription>
                  Ingresa tus datos para procesar la compra de tus boletos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentForm
                  onSubmit={onSubmit}
                  loading={loading}
                  totalAmount={totalAmount}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumen de la compra */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen de compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Tus boletos:</h3>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {selectedTickets.map((numero: number) => (
                      <Badge
                        key={numero}
                        className="bg-green-500 text-white py-1 px-3 mb-1"
                      >
                        <Ticket className="mr-1 h-3 w-3" />#{numero}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-heart-600">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col text-sm text-muted-foreground">
                <p>
                  Al hacer clic en "Pagar", serás redirigido a nuestra pasarela
                  de pagos para completar la transacción de forma segura.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};
