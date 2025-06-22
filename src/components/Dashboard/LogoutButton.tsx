import { authStore } from "@/stores/authStore";
import { cleanSession } from "@/lib/checkLogState";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
  const handleLogout = () => {
    authStore.setState({ isLogged: false });
    cleanSession();
    window.location.href = "/";
  };
  return (
    <Button
      variant="outline"
      className=" text-heart-600 hover:bg-heart-600 hover:text-white"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar sesión
    </Button>
  );
};
