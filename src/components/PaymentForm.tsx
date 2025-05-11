import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone } from "lucide-react";

const checkoutFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  phone: z
    .string()
    .min(10, { message: "Teléfono inválido" })
    .max(10, { message: "Teléfono inválido" }),
  document: z.string().min(8, { message: "Documento inválido" }),
  documentType: z.enum(["CC", "CE", "TI", "PP"], {
    required_error: "Por favor selecciona un tipo de documento",
  }),
  paymentMethod: z.enum(["card", "nequi", "pse"], {
    required_error: "Por favor selecciona un método de pago",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const PaymentForm = ({
  onSubmit,
  loading,
  totalAmount,
}: {
  onSubmit: (data: CheckoutFormValues) => void;
  loading: boolean;
  totalAmount: number;
}) => {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      document: "",
      documentType: "CC",
      paymentMethod: "card",
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="3001234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem className="w-1/3">
                  <FormLabel>Tipo</FormLabel>
                  <select
                    className="w-full h-10 px-3 border border-input rounded-md"
                    {...field}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="TI">TI</option>
                    <option value="PP">PP</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem className="w-2/3">
                  <FormLabel>Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <FormLabel className="text-lg font-medium">Método de pago</FormLabel>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-4 mt-4">
                <Tabs
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger
                      value="card"
                      className="flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      <span>Tarjeta</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="nequi"
                      className="flex items-center gap-2"
                    >
                      <Smartphone size={16} />
                      <span>Nequi</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pse"
                      className="flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-building-bank"
                      >
                        <rect x="3" y="9" width="18" height="12" rx="1" />
                        <path d="M7 19v-7" />
                        <path d="M11 19v-7" />
                        <path d="M15 19v-7" />
                        <path d="M19 19v-7" />
                        <path d="M3 9v0a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v0" />
                        <path d="m3 9 2-6h14l2 6" />
                      </svg>
                      <span>PSE</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="card"
                    className="border rounded-md p-4 mt-4"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      Serás redirigido a la pasarela de pago para ingresar los
                      datos de tu tarjeta de forma segura.
                    </p>
                    <div className="flex gap-2">
                      <img
                        src="https://www.wompi.co/images/logos/visa.svg"
                        alt="Visa"
                        className="h-8"
                      />
                      <img
                        src="https://www.wompi.co/images/logos/mastercard.svg"
                        alt="Mastercard"
                        className="h-8"
                      />
                      <img
                        src="https://www.wompi.co/images/logos/american-express.svg"
                        alt="AmEx"
                        className="h-8"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="nequi"
                    className="border rounded-md p-4 mt-4"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      Pagarás usando tu cuenta de Nequi asociada al número de
                      teléfono que ingresaste.
                    </p>
                    <div className="bg-[#210049] rounded-md p-2 inline-block">
                      <img
                        src="https://www.wompi.co/images/logos/nequi.svg"
                        alt="Nequi"
                        className="h-8"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="pse"
                    className="border rounded-md p-4 mt-4"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      Serás redirigido a tu portal bancario para completar el
                      pago.
                    </p>
                    <div className="bg-[#1997d4] rounded-md p-2 inline-block">
                      <img
                        src="https://www.wompi.co/images/logos/pse.svg"
                        alt="PSE"
                        className="h-8"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-heart-500 hover:bg-heart-600"
          disabled={loading}
        >
          {loading ? "Procesando..." : `Pagar $${totalAmount.toLocaleString()}`}
        </Button>
      </form>
    </Form>
  );
};
