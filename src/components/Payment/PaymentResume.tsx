
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import { stateManager } from "@/stores/stores";

export const PaymentResume = () => {
  const { totalAmount, referenceCode, selectedTickets } = stateManager.getState();
  return (
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
            {referenceCode && (
              <div className="pt-2">
                <span className="text-xs text-muted-foreground block">
                  Referencia de pago
                </span>
                <span className="font-mono text-sm">{referenceCode}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-muted-foreground">
          <p>
            Al hacer clic en "Pagar", serás redirigido a nuestra pasarela de
            pagos para completar la transacción de forma segura.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
