import crypto from "crypto-js";

const createIntegritySignature = ({
  amount,
  referenceCode,
  currency,
  integrityKey,
}: {
  amount: number;
  referenceCode: string;
  currency: string;
  integrityKey: string;
}) => {
  const hash = crypto.SHA256(
    `${referenceCode}${amount}${currency}${integrityKey}`
  );
  return hash.toString();
};

export const WompiPaymentButton = ({
  totalAmount,
  referenceCode,
  currency,
  fullName,
  document = "0",
}: {
  totalAmount: number;
  referenceCode: string;
  currency: string;
  fullName: string;
  document: string;
}) => {
  const {
    SECRET_WOMPI_INTEGRITY_KEY: integrityKey,
    SECRET_WOMPI_PUBLIC_KEY: publicKey,
  } = import.meta.env;
  const integritySignature = createIntegritySignature({
    amount: totalAmount * 100,
    referenceCode,
    currency,
    integrityKey,
  });
  console.log({ integritySignature, publicKey, integrityKey });
  return (
    <script
      src="https://checkout.wompi.co/widget.js"
      data-render="button"
      data-public-key={publicKey}
      data-currency="COP"
      data-amount-in-cents={totalAmount * 100}
      data-reference={referenceCode}
      data-signature:integrity={integritySignature}
      // data-customer-data:full-name={fullName}
      // data-customer-data:legal-id={document}
      // data-customer-data:legal-id-type="CC"
      data-redirect-url="http://localhost:4321/payment/success"
    ></script>
  );
};
