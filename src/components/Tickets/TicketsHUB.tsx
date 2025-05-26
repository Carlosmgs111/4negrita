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
import { Grid3x3, ListOrdered, ShoppingCart, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketsDisplay } from "./TicketsDisplay";
import { TicketsPurchaseConfirm } from "./TicketsPurchaseConfirm";
import { useTickets } from "@/hooks/useTickets";
import { URLManager } from "@/lib/URLManager";

export const TicketsHUB = () => {
  const {
    tickets,
    currentView,
    setCurrentView,
    selectedTickets = [],
    setSelectedTickets,
    handleClearSelection,
    handleCheckout,
  } = useTickets();

  

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
          <input
            type="text"
            onChange={(e) => {
              URLManager.updateURL({ params: { phone: e.target.value } });
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={currentView}
            onValueChange={(value) => setCurrentView(value as "grid" | "list")}
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

         
        </div>
      </div>

      <Card className="border-heart-200 mb-4">
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
          <TicketsDisplay
            tickets={tickets}
            selectedTickets={selectedTickets}
            setSelectedTickets={setSelectedTickets}
            currentView={currentView}
          />
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between pt-4 border-t gap-4">
          <div className="text-sm text-muted-foreground">
            Total: 1000 boletos | Disponibles:
            {tickets.filter((b) => b.estado === "disponible").length}
          </div>
          <div className="flex gap-2">
            {selectedTickets.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearSelection}
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar selección
              </Button>
            )}
            <Button
              className="bg-heart-500 hover:bg-heart-600"
              onClick={handleCheckout}
              disabled={selectedTickets.length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Comprar
              {selectedTickets.length > 0 ? `(${selectedTickets.length})` : ""}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {selectedTickets.length > 0 && (
        <div className="fixed bottom-4 right-1 sm:bottom-8 sm:right-8 z-10">
          <TicketsPurchaseConfirm
            selectedTickets={selectedTickets}
            handleCheckout={handleCheckout}
          />
        </div>
      )}
    </main>
  );
};
