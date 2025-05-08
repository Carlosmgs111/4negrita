import { useState } from "react";
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
import { Ticket, Grid3x3, ListOrdered } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type TicketStatus = "disponible" | "reservado" | "vendido";

interface TicketItem {
  numero: number;
  estado: TicketStatus;
}

// Genera los boletos del 1 al 100
const generarBoletos = (): TicketItem[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    numero: i + 1,
    estado:
      Math.random() > 0.7
        ? Math.random() > 0.5
          ? "vendido"
          : "reservado"
        : "disponible",
  }));
};

export const TicketsHUB = () => {
  const [boletos] = useState<TicketItem[]>(generarBoletos());
  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const getColorByStatus = (status: TicketStatus): string => {
    switch (status) {
      case "disponible":
        return "bg-green-500 hover:bg-green-600";
      case "reservado":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "vendido":
        return "bg-gray-400 hover:bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleTicketClick = (ticket: TicketItem) => {
    if (ticket.estado === "disponible") {
      toast({
        title: "¡Boleto seleccionado!",
        description: `Has seleccionado el boleto #${ticket.numero}`,
        variant: "default",
        duration: 3000,
      });
    } else if (ticket.estado === "reservado") {
      toast({
        title: "Boleto reservado",
        description: `El boleto #${ticket.numero} ya está reservado`,
        variant: "destructive",
        duration: 3000,
      });
    } else {
      toast({
        title: "Boleto no disponible",
        description: `El boleto #${ticket.numero} ya ha sido vendido`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-heart-600">
            Boletos para la Rifa
          </h1>
          <p className="text-muted-foreground">
            Selecciona un boleto para participar en el sorteo benéfico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={vistaActual}
            onValueChange={(value) => setVistaActual(value as "grid" | "list")}
          >
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <Grid3x3 size={16} />
                <span className="hidden sm:inline">Cuadrícula</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <ListOrdered size={16} />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="bg-heart-500 hover:bg-heart-600 ml-2">
            <Ticket className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Comprar</span>
          </Button>
        </div>
      </div>

      <Card className="border-heart-200">
        <CardHeader className="pb-4">
          <CardTitle>Selecciona tu número de la suerte</CardTitle>
          <CardDescription>
            Cada boleto tiene un valor de $10.000 y todo lo recaudado ayudará a
            Sofía.
          </CardDescription>
          <div className="flex gap-2 pt-2">
            <div className="flex items-center gap-1">
              <Badge className="bg-green-500">●</Badge>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-yellow-500">●</Badge>
              <span className="text-sm">Reservado</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-gray-400">●</Badge>
              <span className="text-sm">Vendido</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={vistaActual} className="w-full">
            <TabsContent value="grid" className="m-0">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
                {boletos.map((boleto) => (
                  <button
                    key={boleto.numero}
                    onClick={() => handleTicketClick(boleto)}
                    disabled={boleto.estado === "vendido"}
                    className={`
                        flex items-center justify-center p-2 sm:p-4 rounded-lg font-bold text-white
                        transition-all duration-200 hover:scale-105 
                        ${getColorByStatus(boleto.estado)}
                        ${
                          boleto.estado === "vendido"
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer shadow-sm hover:shadow-md"
                        }
                      `}
                  >
                    {boleto.numero}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {boletos.map((boleto) => (
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
                      `}
                  >
                    <div className="flex items-center gap-3">
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
                        boleto.estado === "disponible"
                          ? "bg-green-500"
                          : boleto.estado === "reservado"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }
                    >
                      {boleto.estado === "disponible"
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
        </CardContent>

        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total: 100 boletos | Disponibles:{" "}
            {boletos.filter((b) => b.estado === "disponible").length}
          </div>
          <Button
            variant="outline"
            className="text-heart-600 border-heart-300 hover:bg-heart-50"
          >
            Actualizar
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
