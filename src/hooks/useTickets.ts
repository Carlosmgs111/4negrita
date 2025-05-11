import { useEffect, useMemo, useState } from "react";
import { useToast } from "./useToast";

type TicketStatus = "disponible" | "reservado" | "vendido";

export interface TicketItem {
  numero: number;
  digito: string;
  estado: TicketStatus;
}

const assignDigit = (numb: number, maxDigits = 3) => {
  const numbArray = String(numb).split("").reverse();
  const con = [];
  con[maxDigits - numbArray.length - 1] = "0";
  con.fill("0");
  return numbArray.concat(con).reverse().join("");
};

const generarBoletos = (): TicketItem[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    numero: i,
    digito: assignDigit(i, 2),
    estado:
      Math.random() > 0.7
        ? Math.random() > 0.5
          ? "vendido"
          : "reservado"
        : "disponible",
  }));
};

const getSelectedTicketsFromURL = (): number[] => {
  try {
    const params = new URLSearchParams(window.location.search);
    const ticketsParam = params.get("tickets");
    if (ticketsParam) {
      return JSON.parse(ticketsParam);
    }
  } catch (error) {
    console.error("Error parsing tickets from URL:", error);
  }
  return [];
};

export const updateURLWithSelectedTickets = (tickets: number[]): void => {
  const params = new URLSearchParams(window.location.search);

  if (tickets.length > 0) {
    params.set("tickets", JSON.stringify(tickets));
  } else {
    params.delete("tickets");
  }

  window.history.pushState(
    {},
    "",
    window.location.pathname +
      (params.toString() ? "?" + params.toString() : "")
  );
};

export const useTickets = () => {
  const tickets: TicketItem[] = useMemo(() => generarBoletos(), []);
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [selectedTickets, setSelectedTickets] = useState<number[]>(
    getSelectedTicketsFromURL()
  );
  const { toast } = useToast();

  useEffect(() => {
    const handlePopState = () => {
      setSelectedTickets(getSelectedTicketsFromURL());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    updateURLWithSelectedTickets(selectedTickets);
  }, [selectedTickets]);

  const handleClearSelection = () => {
    setSelectedTickets([]);

    toast({
      title: "Selección limpiada",
      description: "Se han eliminado todos los boletos de tu selección",
      variant: "default",
      duration: 3000,
    });
  };

  const handleCheckout = () => {
    if (selectedTickets.length === 0) {
      toast({
        title: "No hay boletos seleccionados",
        description: "Debes seleccionar al menos un boleto para continuar",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    window.location.href = "/checkout" + window.location.search;
  };
  return {
    tickets,
    currentView,
    setCurrentView,
    selectedTickets,
    setSelectedTickets,
    handleClearSelection,
    handleCheckout,
  };
};
