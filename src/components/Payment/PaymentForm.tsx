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
import { useToast } from "@/hooks/useToast";
import { WompiPaymentButton } from "./WompiPaymentButton";

const checkoutFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  phone: z
    .string()
    .min(10, { message: "Teléfono inválido" })
    .max(10, { message: "Teléfono inválido" }),
  document: z.number().min(8, { message: "Documento inválido" }),
  documentType: z.enum(["CC", "CE", "TI", "PP"], {
    required_error: "Por favor selecciona un tipo de documento",
  }),
  paymentMethod: z.enum(["card", "nequi", "pse"], {
    required_error: "Por favor selecciona un método de pago",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const PaymentForm = () => {
  // console.log({ totalAmount, referenceCode, selectedTickets });
  const { toast } = useToast();
  const fullName = JSON.parse(localStorage.getItem("participant") || "{}").fullName;
  const email = JSON.parse(localStorage.getItem("user") || "{}").email;
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onChange",
    defaultValues: {
      name: fullName,
      email: email,
      phone: "",
      document: 0,
      documentType: "CC",
      paymentMethod: "card",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data: any) => {
          // e.preventDefault();
          // setFormValues(data);

          toast({
            title: "Información validada",
            description: "Ahora puedes proceder con el pago",
          });
        })}
        className="space-y-6"
      >
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
        <WompiPaymentButton />
      </form>
    </Form>
  );
};
