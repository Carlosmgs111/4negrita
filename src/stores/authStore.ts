import { StateManager } from "@/lib/StateManager";

export const authStore = StateManager.create({
  namespace: "auth",
  initialState: { fullName: "", email: "" },
  useCompression: true,
});
