import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";

export const TicketsPurchaseConfirm = ({
  selectedTickets,
  handleCheckout,
}: {
  selectedTickets: number[];
  handleCheckout: () => void;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`bg-heart-500 hover:bg-heart-600 ml-2 ${
            selectedTickets.length > 0 ? "animate-pulse" : ""
          }`}
          disabled={selectedTickets.length === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Comprar</span>
          {selectedTickets.length > 0 && (
            <Badge className="ml-1 bg-white text-heart-600">
              {selectedTickets.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar selección de boletos</DialogTitle>
          <DialogDescription>
            Estás a punto de comprar los siguientes boletos:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {selectedTickets
              .sort((a, b) => a - b)
              .map((numero) => (
                <Badge
                  key={numero}
                  className="bg-green-500 text-white py-1 px-3"
                >
                  Boleto #{numero}
                </Badge>
              ))}
          </div>
          <div className="mt-4 font-medium">
            Total: {selectedTickets.length}{" "}
            {selectedTickets.length === 1 ? "boleto" : "boletos"} - $
            {selectedTickets.length * 10000}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleCheckout}
            className="bg-heart-500 hover:bg-heart-600"
          >
            Continuar con el pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
