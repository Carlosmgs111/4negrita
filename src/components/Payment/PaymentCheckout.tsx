import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentForm } from "./PaymentForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PaymentResume } from "./PaymentResume";
import { stateManager } from "@/stores/stores";
import { URLManager } from "@/lib/URLManager";

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters.charAt(index);
  }
  return result;
}

export const PaymentCheckout = () => {
  const selectedTickets = stateManager.getState().selectedTickets;
  const totalAmount = selectedTickets.length * 10000;
  const referenceCode = generateRandomString(16);
  stateManager.setState({
    totalAmount,
    referenceCode,
    selectedTickets,
  });

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2 text-heart-600">
            Finaliza tu compra
          </h1>
          <a href={`/tickets?app=${URLManager.getParam("app")}`}>
            <Button variant="ghost" className="pt-2 pb-2 pl-4 pr-6 text-1xl">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </a>
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
                <PaymentForm />
              </CardContent>
            </Card>
          </div>

          <PaymentResume />
        </div>
      </div>
    </main>
  );
};
