import { StateManager } from "@/lib/StateManager";

export const stateManager = StateManager.create({
  namespace: "app",
  initialState: { tickets: [],/*  products: [] */ },
  useCompression: !true,
});
