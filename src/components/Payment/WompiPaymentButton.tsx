import { useEffect, useRef } from "react";
import { stateManager } from "@/stores/stores";
import crypto from "crypto-js";

const createIntegritySignature = ({
  amount,
  reference,
  currency,
  integrityKey,
}: {
  amount: string;
  reference: string;
  currency: string;
  integrityKey: string;
}) => {
  const hash = crypto.SHA256(`${reference}${amount}${currency}${integrityKey}`);
  return hash.toString();
};

export const WompiPaymentButton = () => {
  const { referenceCode, totalAmount } = stateManager.getState();
  const {
    SECRET_WOMPI_INTEGRITY_KEY: integrityKey,
    SECRET_WOMPI_PUBLIC_KEY: publicKey,
  } = import.meta.env;
  console.log({ totalAmount, referenceCode, integrityKey });
  const fullName = JSON.parse(
    localStorage.getItem("participant") || "{}"
  ).fullName;
  const email = JSON.parse(localStorage.getItem("user") || "{}").email;
  const signature = createIntegritySignature({
    amount: String(totalAmount * 100),
    reference: referenceCode,
    currency: "COP",
    integrityKey: integrityKey,
  });
  const scriptRef = useRef<HTMLScriptElement | null>(null) as any;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.setAttribute("data-render", "button");
    script.setAttribute("data-public-key", publicKey);
    script.setAttribute("data-currency", "COP");
    script.setAttribute("data-amount-in-cents", String(totalAmount * 100));
    script.setAttribute("data-reference", referenceCode);
    script.setAttribute("data-signature:integrity", signature);
    script.setAttribute("data-customer-data:full-name", fullName);
    script.setAttribute("data-customer-data:email", email);
    script.setAttribute("data-customer-data:legal-id", "123456789");
    script.setAttribute("data-customer-data:legal-id-type", "CC");
    script.setAttribute("data-redirect-url", "http://localhost:4321/payment/success");

    scriptRef.current?.appendChild(script);

    return () => {
      // Limpiar en caso de rerender
      if (scriptRef.current) {
        scriptRef.current.innerHTML = "";
      }
    };
  }, [totalAmount, referenceCode, signature]);

  return <div ref={scriptRef}></div>;
};
