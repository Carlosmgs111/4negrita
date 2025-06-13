import type { APIRoute } from "astro";
import crypto from "crypto";

interface WompiWebhookData {
  event: string;
  data: {
    transaction: {
      id: string;
      status: "APPROVED" | "DECLINED" | "PENDING" | "VOIDED";
      reference: string;
      amount_in_cents: number;
      currency: string;
      customer_email: string;
      payment_method_type: string;
      payment_method: any;
      created_at: string;
      finalized_at?: string;
    };
  };
  sent_at: string;
}

// Verificar firma del webhook (importante para seguridad)
function verifyWompiSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-wompi-signature") || "";
    const webhookSecret = process.env.WOMPI_WEBHOOK_SECRET!;

    // Verificar la firma del webhook
    if (!verifyWompiSignature(body, signature, webhookSecret)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookData: WompiWebhookData = JSON.parse(body);

    // if (webhookData.event === "transaction.updated") {
    //   const transaction = webhookData.data.transaction;

    //   // Actualizar estado en tu base de datos
    //   await updateTransactionInDatabase(transaction);

    //   // Notificar a los clientes conectados via WebSocket/SSE
    //   await notifyClients(transaction);

    //   // Enviar email/SMS si es necesario
    //   if (transaction.status === "APPROVED") {
    //     await sendPaymentConfirmation(transaction);
    //   } else if (transaction.status === "DECLINED") {
    //     await sendPaymentFailure(transaction);
    //   }
    // }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
};
