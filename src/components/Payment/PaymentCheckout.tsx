import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentForm } from "./PaymentForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PaymentResume } from "./PaymentResume";
import { generateFinancialReference } from "@/lib/genRefCode";

export const CheckoutStep = ({ tickets }: { tickets: number[] }) => {
  const totalAmount = tickets.length * 10000;
  console.log({ totalAmount });
  const selectedTickets = tickets;
  const referenceCode =
    "4N" +
    generateFinancialReference({
      transactionType: "PAY",
      clientId: "123456789",
      amount: totalAmount,
      date: new Date(),
    });

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2 text-heart-600">
            Finaliza tu compra
          </h1>
          <a
            href={`/tickets?tickets=${encodeURIComponent(
              JSON.stringify(tickets)
            )}`}
          >
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
                <PaymentForm
                  totalAmount={totalAmount}
                  referenceCode={referenceCode}
                />
              </CardContent>
            </Card>
          </div>

          <PaymentResume
            totalAmount={totalAmount}
            referenceCode={referenceCode}
            selectedTickets={selectedTickets}
          />
        </div>
      </div>
    </main>
  );
};
