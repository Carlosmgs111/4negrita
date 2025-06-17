import crypto from "crypto-js";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { paymentStore } from "@/stores/payment";
import { decodeRaffleReference } from "@/lib/genRefCode";

const createIntegritySignature = ({
  amount,
  referenceCode,
  currency,
  integrityKey,
  expirationTime,
}: {
  amount: number;
  referenceCode: string;
  currency: string;
  integrityKey: string;
  expirationTime?: string;
}) => {
  const hash = crypto.SHA256(
    `${referenceCode}${amount}${currency}${
      expirationTime ? expirationTime : ""
    }${integrityKey}`
  );
  return hash.toString();
};

export const WompiPaymentButton = ({
  redirectUrl,
  totalAmount,
  currency = "COP",
  fullName,
  email,
  phone,
  document,
  documentType,
}: {
  redirectUrl: string;
  totalAmount: number;
  currency: string;
  fullName: string;
  email: string;
  phone: string;
  document: string;
  documentType: string;
  expirationTime?: string;
}) => {
  const {
    SECRET_WOMPI_INTEGRITY_KEY: integrityKey,
    SECRET_WOMPI_PUBLIC_KEY: publicKey,
  } = import.meta.env;
  const { expirationTime, referenceCode } = paymentStore.getState();
  const { raffleId, userId, tickets } = decodeRaffleReference(referenceCode)!;
  if (
    raffleId === "undefined" ||
    userId === "undefined" ||
    tickets.length === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <p className="text-center text-red-800 text-xs p-2">
            ⚠️ Atención, Hubo un error al cargar el pago ⚠️
          </p>
          <a
            href="/?clear=true"
            className="text-center text-white text-sm bg-red-500 hover:bg-red-600 p-2 border border-red-500 rounded"
          >
            Regresar a la página principal
          </a>
        </CardHeader>
      </Card>
    );
  }
  const integritySignature = createIntegritySignature({
    amount: totalAmount * 100,
    referenceCode,
    currency,
    integrityKey,
    expirationTime,
  });
  return (
    <Card>
      <CardHeader>
        <script
          src="https://checkout.wompi.co/widget.js"
          data-render="button"
          data-public-key={publicKey}
          data-currency={currency}
          data-amount-in-cents={totalAmount * 100}
          data-reference={referenceCode}
          data-signature:integrity={integritySignature}
          data-customer-data:full-name={fullName}
          data-customer-data:email={email}
          data-customer-data:phone-number-prefix={phone && "57"}
          data-customer-data:phone-number={phone}
          data-customer-data:legal-id={
            document && documentType ? document : null
          }
          data-customer-data:legal-id-type={
            document && documentType ? documentType : null
          }
          data-redirect-url={redirectUrl}
          data-expiration-time={expirationTime || null}
        ></script>
      </CardHeader>
      <CardFooter>
        <div className="flex justify-center items-center w-full text-xs">
          Powered by &nbsp;
          <a href="https://wompi.com/es/co/que-es-wompi">
            <img
              src="https://wompi.com/assets/downloadble/logos_wompi/Wompi_LogoPrincipal.svg"
              alt="Powered by Wompi"
              className="h-10 w-auto"
            />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
