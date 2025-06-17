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
import { paymentStore } from "@/stores/payment";
import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";
import { decodeRaffleReference } from "@/lib/genRefCode";

const queryExitingTickets = async (tickets: number[], raffleId: string) => {
  const { data: existing, error } = await supabase
    .from("ticket")
    .select("raffleId, number, id, reservedUntil")
    .eq("raffleId", raffleId)
    .in("number", tickets);

  if (error) {
    return [null, error];
  }
  const numerosExistentes = existing.map((t: any) => {
    const isReserved = t.reservedUntil > new Date();
    if (!isReserved) {
      supabase.from("ticket").update({ status: "available" }).eq("id", t.id);
    }
    return t.number;
  });
  const numerosNoExisten = tickets.filter(
    (num) => !numerosExistentes.includes(num)
  );
  return [
    {
      existing,
      notExisting: numerosNoExisten.map((num) => ({ raffleId, number: num })),
    },
    null,
  ];
};

const createTickets = (notExisting: number[], expirationTime: string) => {
  const reservedUntil = expirationTime;
  const notExistingTickets = notExisting.map((ticket: any) => {
    const digits = Number(ticket.number - 1)
      .toString()
      .padStart(3, "0");
    return {
      number: ticket.number,
      digits: digits,
      status: "reserved",
      price: 5000,
      issueDate: new Date().toISOString(),
      soldAt: new Date().toISOString(),
      id: uuid(),
      raffleId: "4ea8cf0d-8152-4fae-8c50-bbda843aae44",
      userId: "3d34bc76-de25-4b44-9daf-5f49d3613d00",
      reservedUntil,
    };
  });
  supabase
    .from("ticket")
    .upsert(notExistingTickets)
    .select()
    .then((res: any) => {})
    .catch((err: any) => {});
};

const updateTickets = (existing: any[], expirationTime: string) => {
  const existingIds = existing.map((t: any) => t.id);
  const reservedUntil = expirationTime;
  supabase
    .from("ticket")
    .update({
      status: "reserved",
      reservedUntil,
    })
    .in("id", existingIds)
    .then((res: any) => {})
    .catch((err: any) => {});
};

export const PaymentResume = async () => {
  const { totalAmount, selectedTickets } = stateManager.getState();
  const { raffleId, userId, expirationTime, referenceCode } =
    paymentStore.getState();
  console.log(paymentStore.getState());
  console.log(":::decoded:::\n",decodeRaffleReference(referenceCode));
  const [{ existing, notExisting }, error] = await queryExitingTickets(
    selectedTickets,
    raffleId
  );
  createTickets(notExisting, expirationTime);
  updateTickets(existing, expirationTime);

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
                  <Ticket className="mr-1 h-3 w-3" />#
                  {Number(numero - 1)
                    .toString()
                    .padStart(3, "0")}
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
            <div className="pt-2">
              <span className="text-xs text-muted-foreground block">
                ID de la rifa
              </span>
              <span className="font-mono text-xs">
                {raffleId}
              </span>
            </div>
            {referenceCode && (
              <div className="pt-2">
                <span className="text-xs text-muted-foreground block">
                  Referencia de pago
                </span>
                <span className="font-mono text-xs">
                  ...{referenceCode.slice(-32)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-muted-foreground items-left">
          <p>
            Ahora haz clic en el botón "Paga con Wompi" para ser redirigido a la
            pasarela de pagos de Wompi, donde podrás completar la transacción de
            forma segura.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
