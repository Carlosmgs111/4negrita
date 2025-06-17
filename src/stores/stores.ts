import { StateManager } from "@/lib/StateManager";

export const stateManager = StateManager.create({
  namespace: "app",
  initialState: {
    selectedTickets: [],
    totalAmount: 0,
    referenceCode: "",
    totalTickets: 0,
    tickets: null,
    ticketPrice: 0,
    playDate: "",
    limitDate: "",
    drawId: "",
    raffleId: "",
  },
  useCompression: true,
});
