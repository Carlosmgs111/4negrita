import {StateManager} from "../lib/StateManager";

export const paymentStore = StateManager.create({
  namespace: "payment",
  initialState: {
    referenceCode: "",
    expirationTime: "",
    raffleId: "",
    userId: "",
    ticketsNumber: [],
  },
  useCompression: true,
});