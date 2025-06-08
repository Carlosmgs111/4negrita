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
  email,
  phone,
  document,
  documentType,
}: {
  totalAmount: number;
  referenceCode: string;
  currency: string;
  fullName: string;
  email: string;
  phone: string;
  document: string;
  documentType: string;
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
  console.log({ fullName });
  return (
    <form>
      <script
        src="https://checkout.wompi.co/widget.js"
        data-render="button"
        data-public-key={publicKey}
        data-currency="COP"
        data-amount-in-cents={totalAmount * 100}
        data-reference={referenceCode}
        data-phone-number={phone}
        data-signature:integrity={integritySignature}
        data-customer-data:full-name={fullName}
        data-customer-data:email={email}
        data-customer-data:phone-number-prefix={phone && "57"}
        data-customer-data:phone-number={phone}
        data-customer-data:legal-id={document && documentType ? document : null}
        data-customer-data:legal-id-type={
          document && documentType ? documentType : null
        }
        data-redirect-url="http://localhost:4321/payment/success"
      ></script>
    </form>
  );
};
