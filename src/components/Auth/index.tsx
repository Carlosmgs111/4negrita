import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Login } from "@/components/Auth/Login";
import { Signup } from "@/components/Auth/Signup";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex-1 flex items-center justify-center p-4 flex-col flex-end gap-4 width-content">
      <a href={`/`}>
        <Button variant="ghost" className="pt-2 pb-2 pl-4 pr-6 text-1xl ">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
      </a>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-heart-600">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <Login onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
