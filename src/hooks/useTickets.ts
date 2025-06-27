import { useEffect, useMemo, useState } from "react";
import { useToast } from "./useToast";
import { stateManager } from "@/stores/stores";
import { authStore } from "@/stores/authStore";
import { paymentStore } from "@/stores/payment";
import { Button } from "@/components/ui/button";
import {
  decodeRaffleReference,
  generateRaffleReference,
} from "@/lib/genRefCode";

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
  const [tickets, setTickets] = useState<TicketItem[]>(
    generateMissingTickets(createdTickets)
  );
  const memoizedTickets: TicketItem[] = useMemo(() => tickets, [tickets]);
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [selectedTickets, setSelectedTickets] = useState<number[]>(
    stateManager.getState().selectedTickets
  );
  const memoizedSelectedTickets = useMemo(
    () => selectedTickets,
    [selectedTickets]
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
    const totalAmount = memoizedSelectedTickets.length * 5000;
    stateManager.setState(
      { selectedTickets: memoizedSelectedTickets, totalAmount },
      true
    );
  }, [memoizedSelectedTickets]);

  const handleClearSelection = () => {
    setSelectedTickets([]);
    toast({
      title: "Selección limpiada",
      description: "Se han eliminado todos los boletos de tu selección",
      variant: "default",
      duration: 3000,
    });
  };

  const handleCheckout = async () => {
    if (memoizedSelectedTickets.length === 0) {
      toast({
        title: "No hay boletos seleccionados",
        description: "Debes seleccionar al menos un boleto para continuar",
        variant: "destructive",
        duration: 3000,
      });

      return;
    }
    const availability = await fetch(
      "/api/ticket/" +
        raffleId +
        "/" +
        memoizedSelectedTickets.join(",") +
        "?properties=status,number"
    ).then((res) => res.json());
    console.log({ availability });
    if (
      availability.data.some((ticket: any) => ticket.status !== "available")
    ) {
      toast({
        title: "Boletos no disponibles",
        description:
          "Algunos de los boletos que intentas comprar no estan disponibles 🤔, por favor verifica de nuevo la disponibilidad ✅ de los boletos 🎫  y selecciona de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
      fetch("/api/ticket")
        .then((res) => res.json())
        .then((data) => {
          console.log({ data });
          setTickets(generateMissingTickets(data));
          setTimeout(() => setSelectedTickets([]), 1000);
        });
      return;
    }

    const userId = JSON.parse(sessionStorage.getItem("user") || "{}").id;
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const referenceCode = generateRaffleReference({
      raffleId,
      userId,
      tickets: memoizedSelectedTickets,
    });
    paymentStore.setState({
      referenceCode,
      expirationTime,
      userId,
    });
    window.location.href =
      "/payment/checkout" +
      window.location.search +
      `&auth=${authStore.getSerializedState()}&payment=${paymentStore.getSerializedState()}`;
  };
  return {
    tickets: memoizedTickets,
    currentView,
    setCurrentView,
    selectedTickets: memoizedSelectedTickets,
    setSelectedTickets,
    handleClearSelection,
    handleCheckout,
    state,
  };
};
