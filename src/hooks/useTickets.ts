import { useEffect, useMemo, useState } from "react";
import { useToast } from "./useToast";
import { stateManager } from "@/stores/stores";
import { authStore } from "@/stores/authStore";
import { paymentStore } from "@/stores/payment";
import { decodeRaffleReference, generateRaffleReference } from "@/lib/genRefCode";

type TicketStatus = "available" | "reserved" | "sold";

export interface TicketItem {
  number: number;
  digits: string;
  status: TicketStatus;
}

const assignDigit = (numb: number, maxDigits = 3) => {
  const numbArray = String(numb).split("").reverse();
  const con = [];
  con[maxDigits - numbArray.length - 1] = "0";
  con.fill("0");
  return numbArray.concat(con).reverse().join("");
};

const generateMissingTickets = (createdTickets: TicketItem[]): TicketItem[] => {
  return Array.from({ length: 1000 }, (_, i) => {
    const cretedTicket = createdTickets.find(
      (ticket: any) => ticket.number == i + 1
    );
    if (cretedTicket)
      return {
        number: i + 1,
        digits: cretedTicket.digits,
        status: cretedTicket.status,
      };
    return {
      number: i + 1,
      digits: assignDigit(i, 3),
      status: "available",
    };
  });
};

export const useTickets = ({
  createdTickets,
  raffleId,
}: {
  createdTickets: TicketItem[];
  raffleId: string;
}) => {
  const tickets: TicketItem[] = useMemo(
    () => generateMissingTickets(createdTickets),
    []
  );
  console.log(stateManager.getState());
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [selectedTickets, setSelectedTickets] = useState<number[]>(
    stateManager.getState().selectedTickets
  );
  const { toast } = useToast();
  const state = stateManager.getState();

  useEffect(() => {
    const handlePopState = () => {
      setSelectedTickets(state.selectedTickets);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const totalAmount = selectedTickets.length * 5000;
    stateManager.setState(
      { selectedTickets, totalAmount },
      true
    );
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
    const userId = JSON.parse(sessionStorage.getItem("user") || "{}").id;
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    console.log(stateManager.getState());
    console.log({raffleId, userId, tickets: selectedTickets});
    const referenceCode = generateRaffleReference({
      raffleId,
      userId,
      tickets: selectedTickets,
    });
    console.log(referenceCode);
    paymentStore.setState({
      referenceCode,
      expirationTime,
      userId,
    });
    window.location.href =
      "/checkout" +
      window.location.search +
      `&auth=${authStore.getSerializedState()}&payment=${paymentStore.getSerializedState()}`;
  };
  return {
    tickets,
    currentView,
    setCurrentView,
    selectedTickets,
    setSelectedTickets,
    handleClearSelection,
    handleCheckout,
    state,
  };
};
