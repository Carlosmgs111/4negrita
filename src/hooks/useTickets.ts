import { useEffect, useMemo, useState } from "react";
import { useToast } from "./useToast";
import { stateManager } from "@/stores/stores";
import { authStore } from "@/stores/authStore";

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
const referenceCode = generateRandomString(16);

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
    const cretedTicket = createdTickets.find((ticket: any) => ticket.number == i + 1);
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
}: {
  createdTickets: TicketItem[];
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
      { selectedTickets, referenceCode, totalAmount },
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
    window.location.href =
      "/checkout" +
      window.location.search +
      `&auth=${authStore.getSerializedState()}`;
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
