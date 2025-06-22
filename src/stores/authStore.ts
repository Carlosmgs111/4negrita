import { StateManager } from "@/lib/StateManager";

export const authStore = StateManager.create({
  namespace: "auth",
  initialState: { fullName: "", email: "", isLogged: false, userId: "" },
  useCompression: true,
});
