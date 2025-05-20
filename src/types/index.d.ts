import { URLManager } from "../lib/urlManager";

declare module "@supabase/supabase-js";
declare global {
  interface Window {
    urlManager: typeof URLManager;
  }
}
