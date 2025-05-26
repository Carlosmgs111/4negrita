import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/useToast";
import type { TicketItem } from "@/hooks/useTickets";

type TicketStatus = "disponible" | "reservado" | "vendido";

export const TicketsDisplay = ({
  tickets,
  selectedTickets,
  setSelectedTickets,
  currentView,
}: {
  tickets: TicketItem[];
  selectedTickets: number[];
  setSelectedTickets: (
    tickets: number[] | ((prev: number[]) => number[])
  ) => void;
  currentView: "grid" | "list";
}) => {
  const isSelected = (numero: number) => selectedTickets.includes(numero);
  const { toast } = useToast();
  const getColorByStatus = (status: TicketStatus): string => {
    return {
      disponible: "bg-green-500 hover:bg-green-600",
      reservado: "bg-yellow-500 hover:bg-yellow-600",
      vendido: "bg-gray-400 hover:bg-gray-500",
    }[status];
  };

  const handleTicketClick = (ticket: TicketItem) => {
    if (ticket.estado === "disponible") {
      setSelectedTickets((prev) => {
        const newSelection = prev.includes(ticket.numero)
          ? prev.filter((num) => num !== ticket.numero)
          : [...prev, ticket.numero];

        if (prev.includes(ticket.numero)) {
          console.log("Boleto deseleccionado");
          toast({
            title: "Boleto deseleccionado",
            description: `Has quitado el boleto #${ticket.numero} de tu selección`,
            variant: "default",
            duration: 3000,
          });
        } else {
          toast({
            title: "¡Boleto seleccionado!",
            description: `Has añadido el boleto #${ticket.numero} a tu selección`,
            variant: "default",
            duration: 3000,
          });
        }

        return newSelection;
      });
      return;
    }

    if (ticket.estado === "reservado") {
      toast({
        title: "Boleto reservado",
        description: `El boleto #${ticket.numero} ya está reservado`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "Boleto no disponible",
      description: `El boleto #${ticket.numero} ya ha sido vendido`,
      variant: "destructive",
      duration: 3000,
    });
  };
  return (
    <Tabs value={currentView}>
      <TabsContent value="grid" className="m-0">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
          {tickets.map((boleto) => (
            <button
              key={boleto.numero}
              onClick={() => handleTicketClick(boleto)}
              disabled={boleto.estado === "vendido"}
              className={`
                        relative flex items-center justify-center p-2 sm:p-4 rounded-lg font-bold text-white
                        transition-all duration-200 hover:scale-105 
                        ${getColorByStatus(boleto.estado)}
                        ${
                          boleto.estado === "vendido"
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer shadow-sm hover:shadow-md"
                        }
                        ${
                          isSelected(boleto.numero)
                            ? "ring-4 ring-heart-500"
                            : ""
                        }
                      `}
            >
              {boleto.digito}
              {isSelected(boleto.numero) && (
                <div className="absolute -top-2 -right-2 bg-heart-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="list" className="m-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {tickets.map((boleto) => (
            <div
              key={boleto.numero}
              onClick={() =>
                boleto.estado !== "vendido" && handleTicketClick(boleto)
              }
              className={`
                        flex items-center justify-between p-3 rounded-lg
                        transition-all duration-200 hover:scale-[1.02] border
                        ${
                          boleto.estado === "disponible"
                            ? "border-green-500 hover:border-green-600"
                            : boleto.estado === "reservado"
                            ? "border-yellow-500 hover:border-yellow-600"
                            : "border-gray-300"
                        }
                        ${
                          boleto.estado === "vendido"
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer shadow-sm hover:shadow-md"
                        }
                        ${
                          isSelected(boleto.numero)
                            ? "ring-2 ring-heart-500 bg-heart-50"
                            : ""
                        }
                      `}
            >
              <div className="flex items-center gap-3">
                {boleto.estado === "disponible" && (
                  <Checkbox
                    checked={isSelected(boleto.numero)}
                    className="border-green-500 data-[state=checked]:bg-heart-500"
                    onClick={(e: any) => e.stopPropagation()}
                    onCheckedChange={() => handleTicketClick(boleto)}
                  />
                )}
                <Ticket
                  size={18}
                  className={
                    boleto.estado === "disponible"
                      ? "text-green-500"
                      : boleto.estado === "reservado"
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }
                />
                <span className="font-medium">
                  Boleto #{boleto.numero.toString().padStart(3, "0")}
                </span>
              </div>
              <Badge
                className={
                  isSelected(boleto.numero)
                    ? "bg-heart-500"
                    : boleto.estado === "disponible"
                    ? "bg-green-500"
                    : boleto.estado === "reservado"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }
              >
                {isSelected(boleto.numero)
                  ? "Seleccionado"
                  : boleto.estado === "disponible"
                  ? "Disponible"
                  : boleto.estado === "reservado"
                  ? "Reservado"
                  : "Vendido"}
              </Badge>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
