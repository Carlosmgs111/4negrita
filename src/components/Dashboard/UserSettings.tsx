import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { User, Phone, Mail, MapPin, Save } from "lucide-react";
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
    console.log({storedUser});
    console.log({storedParticipant});
    // Initialize form with existing user data
    setFormData({
      name: storedParticipant.fullName || "",
      phone: storedUser.phone.slice(2) || "",
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
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "El nombre y teléfono son campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        phone: `+57${formData.phone}`,
        participantId: participant.id,
      }),
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
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, ...updatedUser, phone: `+57${formData.phone}` })
    );
    setUser({ ...user, ...updatedUser, phone: `+57${formData.phone}` });
    setParticipant({ ...participant });
    toast({
      title: "Información actualizada",
      description: "Tus datos han sido guardados exitosamente",
    });
  };

  return (
    <Card className="flex flex-col justify-between items-center w-full">
      <CardHeader>
        <CardTitle className="text-xl text-heart-600 flex items-center">
          <User className="mr-2" size={24} />
          Configuraciones de Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 w-full">
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
            <Label htmlFor="phone">Teléfono *</Label>
            <div className="relative">
              <Input
                disabled
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="3211234567"
              />
              <Phone
                className="absolute right-3 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Input
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
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-between w-full gap-2">
        <p className="text-sm text-gray-500 text-center">
          * Campos obligatorios.
        </p>
        <p className="text-sm text-gray-500 text-center">
          El <b>correo electrónico</b>, el <b>nombre</b> y la <b>dirección</b>
          &nbsp; son datos que pueden ser usados para completar la facturación.
        </p>
        <Button
          onClick={handleSave}
          className="w-full bg-heart-500 hover:bg-heart-600"
        >
          <Save className="mr-2" size={18} />
          Guardar cambios
        </Button>
      </CardFooter>
    </Card>
  );
};
