import { generateFinancialReference } from "@/lib/genRefCode";

// Function to create a Wompi payment link
export const usePayment = async (
  amount: number,
  reference: string,
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  redirectUrl: string
) => {
  // Convert amount to cents (Wompi requires amount in cents)
  const amountInCents = Math.round(amount * 100);

  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Wompi public key is not configured");
  }

  // Get base URL based on environment
  const isProduction = import.meta.env.PROD;
  const baseUrl = isProduction
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

  try {
    // First, get the merchant ID using the public key
    const merchantResponse = await fetch(`${baseUrl}/merchants/${publicKey}`);
    const merchantData = await merchantResponse.json();

    if (!merchantResponse.ok) {
      console.error("Error fetching merchant data:", merchantData);
      throw new Error("Failed to fetch merchant data");
    }

    const merchantId = merchantData.data.id;

    // Create payment link
    const response = await fetch(`${baseUrl}/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicKey}`,
      },
      body: JSON.stringify({
        name: `Boletos Rifa - ${reference}`,
        description: `Compra de boletos para rifa benéfica - Ref: ${reference}`,
        single_use: true,
        currency: "COP",
        amount_in_cents: amountInCents,
        redirect_url: redirectUrl,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // Link expires in 1 hour
        customer_data: {
          email: customerEmail,
          full_name: customerName,
          phone_number: customerPhone,
        },
        collect_shipping: false,
        collect_customer_legal_id: true,
        merchant_id: merchantId,
      }),
    });

    const paymentData = await response.json();

    if (!response.ok) {
      console.error("Error creating payment link:", paymentData);
      throw new Error(
        paymentData.error?.message || "Failed to create payment link"
      );
    }

    return paymentData.data;
  } catch (error) {
    console.error("Error in Wompi payment creation:", error);
    throw error;
  }
};
