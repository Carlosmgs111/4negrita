import { StateManager } from "@/lib/StateManager";
console.log("::::::::::::::::::\n", "setting state", "\n::::::::::::::::::");

export const stateManager = StateManager.create({
  namespace: "app",
  initialState: {
    selectedTickets: [],
    totalAmount: 0,
    referenceCode: "",
    totalTickets: undefined,
    tickets: [],
  },
  useCompression: true,
});
