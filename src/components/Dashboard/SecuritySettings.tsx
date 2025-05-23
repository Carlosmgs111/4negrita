import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const SecuritySettings = () => {
  const { toast } = useToast();
    const [passwords, setPasswords] = useState({
      newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    // Validate fields

    if (!passwords.newPassword.trim() || passwords.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }
    
    const { data, error } = await supabase.auth.updateUser({
      password: passwords.newPassword
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    console.log("Password updated successfully");

    // Clear form
    setPasswords({
      newPassword: "",
      confirmPassword: ""
    });

    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido cambiada exitosamente",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-heart-600 flex items-center">
          <Lock className="mr-2" size={20} />
          Configuraciones de Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwords.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleChangePassword}
            className="w-full bg-heart-500 hover:bg-heart-600"
          >
            <Lock className="mr-2" size={18} />
            Cambiar contraseña
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          * Campos obligatorios. La contraseña debe tener al menos 6 caracteres.
        </p>
      </CardContent>
    </Card>
  );
};
