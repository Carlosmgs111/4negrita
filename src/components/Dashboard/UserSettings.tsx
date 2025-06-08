import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { User, Phone, Mail, MapPin, Save } from "lucide-react";
import { cleanSession } from "@/lib/checkLogState";
// import { supabase } from "@/lib/supabase";

export const UserSettings = () => {
  const [user, setUser] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  const handleLogout = () => {
    cleanSession();
    window.location.href = "/";
  };

  useEffect(() => {
    // Check if user is logged in
    const storedParticipant = JSON.parse(
      localStorage.getItem("participant") || "{}"
    );
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedParticipant || !storedUser) {
      window.location.href = "/auth/login";
      return;
    }
    setUser(storedUser);
    setParticipant(storedParticipant);

    // Initialize form with existing user data
    setFormData({
      name: storedParticipant.fullName || "",
      phone: storedUser.phone || "",
      email: storedUser.email || "",
      address: storedParticipant.address || "",
      city: storedParticipant.city || "",
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "El nombre y correo son campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, participantId: participant.id }),
    });
    const result = await response.json();
    const { user: updatedUser, error } = result;
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem(
      "participant",
      JSON.stringify({
        ...participant,
        fullName: formData.name,
        address: formData.address,
        city: formData.city,
      })
    );
    localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
    setUser({ ...user, ...updatedUser });
    setParticipant({ ...participant });
    toast({
      title: "Información actualizada",
      description: "Tus datos han sido guardados exitosamente",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl text-heart-600 flex items-center">
          <User className="mr-2" size={24} />
          Mi Perfil
        </CardTitle>
        <Button
          variant="outline"
          className="border-heart-500 text-heart-500 hover:bg-heart-50"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
              />
              <User
                className="absolute right-3 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="relative">
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="3001234567"
              />
              <Phone
                className="absolute right-3 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico *</Label>
          <div className="relative">
            <Input
              disabled
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
            />
            <Mail className="absolute right-3 top-3 text-gray-400" size={16} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <div className="relative">
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Tu dirección"
              />
              <MapPin
                className="absolute right-3 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Tu ciudad"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="w-full bg-heart-500 hover:bg-heart-600"
          >
            <Save className="mr-2" size={18} />
            Guardar cambios
          </Button>
        </div>

        <p className="text-sm text-gray-500 text-center">
          * Campos obligatorios
        </p>
      </CardContent>
    </Card>
  );
};
