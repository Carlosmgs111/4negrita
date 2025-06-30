export const config = {
  runtime: "edge",
};

import type { APIRoute } from "astro";
import crypto from "crypto";
import { decodeRaffleReference } from "@/lib/genRefCode";
import { supabase } from "@/lib/supabase";

interface WompiWebhookData {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email: string;
      currency: string;
      payment_method_type: string;
      redirect_url: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
      shipping_address: null | string;
      payment_link_id: null | string;
      payment_source_id: null | string;
    };
  };
  signature: {
    properties: [
      "transaction.id",
      "transaction.status",
      "transaction.amount_in_cents"
    ];
    checksum: string;
  };
  environment: "test" | "prod";
  sent_at: string;
  timestamp: number;
}

export const POST: APIRoute = async ({ request }) => {
  console.log("Webhook received");
  try {
    const body = await request.text();
    const signature = request.headers.get("X-Event-Checksum") || "";
    const webhookSecret = import.meta.env.SECRET_WOMPI_EVENTS_KEY!;
    const webhookData: WompiWebhookData = JSON.parse(body);
    const transaction = webhookData.data.transaction;
    const { reference } = transaction;
    const decodedReference = decodeRaffleReference(reference);
    console.log({ decodedReference });
    console.log({ transaction });
    const sum = [
      transaction.id,
      transaction.status,
      transaction.amount_in_cents,
      webhookData.timestamp,
      webhookSecret,
    ].join("");
    const checksum = crypto.createHash("sha256").update(sum).digest("hex");
    console.log({ checksum, signature });
    const areEqual = crypto.timingSafeEqual(
      Buffer.from(checksum),
      Buffer.from(signature)
    );
    console.log({ areEqual });
    if (!areEqual) {
      return Response.json({ error: "Invalid signature" }, { status: 200 });
    }
    const canceledStatuses: string[] = ["DECLINED", "VOIDED", "ERROR"];
    const { raffleId, userId, tickets } = decodedReference!;
    let status: string = "available";

    if (transaction.status === "APPROVED") status = "sold";
    if (canceledStatuses.includes(transaction.status)) status = "available";
    console.log(await supabase.auth.getSession());
    const { data, error } = await supabase
      .from("ticket")
      .update({ status, userId })
      .eq("raffleId", raffleId)
      .in("number", tickets);
    console.log({ data, error });
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  } finally {
    return Response.json({ received: true }, { status: 200 });
  }
};
