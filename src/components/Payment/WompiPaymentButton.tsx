import crypto from "crypto-js";

const createIntegritySignature = ({
  amount,
  reference,
  currency,
  integrityKey,
}: {
  amount: number;
  reference: string;
  currency: string;
  integrityKey: string;
}) => {
  const hash = crypto.HmacSHA256(`${reference}${amount}${currency}`, integrityKey);
  return hash.toString();
};

export const WompiPaymentButton = ({
  amount,
  reference,
  currency,
}: {
  amount: number;
  reference: string;
  currency: string;
}) => {
  const integritySignature = createIntegritySignature({
    amount,
    reference,
    currency,
    integrityKey: import.meta.env.WOMPI_INTEGRITY_KEY,
  });
  console.log({ integritySignature });
  return (
    <script
      src="https://checkout.wompi.co/widget.js"
      data-render="button"
      data-public-key={import.meta.env.WOMPI_PUBLIC_KEY}
      data-currency="COP"
      data-amount-in-cents={amount}
      data-reference={reference}
      data-signature:integrity={integritySignature}
      data-customer-data:full-name="4Negrita"
      data-customer-data:legal-id="123456789"
      data-customer-data:legal-id-type="CC"
    ></script>
  );
};
