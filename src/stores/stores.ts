import { StateManager } from "@/lib/StateManager";

export const stateManager = StateManager.create({
  namespace: "app",
  initialState: {
    selectedTickets: [],
    totalAmount: 0,
    referenceCode: "",
    totalTickets: undefined,
    tickets: [],
    ticketPrice: 0,
    playDate: "",
    limitDate: "",
  },
  useCompression: true,
});