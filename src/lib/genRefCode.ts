/**
 * Generador de Referencias Comprimidas para Rifas con Salt
 * Formato: BASE62(COMPRESSED(RAFFLE_ID|USER_ID|TICKETS|SALT|CHECK))
 */
import * as pako from "pako";

const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const b62Encode = (data: Uint8Array): string => {
  if (!data.length) return "";
  let num = data.reduce((acc, byte) => acc * 256n + BigInt(byte), 0n);
  if (!num) return B62[0];
  let result = "";
  while (num > 0n) {
    result = B62[Number(num % 62n)] + result;
    num /= 62n;
  }
  return result;
};

const b62Decode = (str: string): Uint8Array => {
  if (!str) return new Uint8Array(0);
  let num = str.split("").reduce((acc, char) => {
    const idx = B62.indexOf(char);
    if (idx === -1) throw new Error("Invalid Base62");
    return acc * 62n + BigInt(idx);
  }, 0n);
  if (!num) return new Uint8Array([0]);
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  return new Uint8Array(bytes);
};

const genSalt = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const checksum = (str: string) =>
  str.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) % 10;

const compactTickets = (tickets: number[]): string => {
  const valid = [
    ...new Set(tickets.filter((t) => Number.isInteger(t) && t > 0)),
  ].sort((a, b) => a - b);
  if (!valid.length) return "0";

  const ranges: string[] = [];
  let [start, end] = [valid[0], valid[0]];

  for (let i = 1; i <= valid.length; i++) {
    const curr = valid[i];
    if (curr === end + 1) {
      end = curr;
    } else {
      ranges.push(
        start === end
          ? `${start}`
          : end === start + 1
          ? `${start},${end}`
          : `${start}-${end}`
      );
      if (i < valid.length) [start, end] = [curr, curr];
    }
  }
  return ranges.join(",");
};

const parseTickets = (code: string): number[] => {
  if (!code || code === "0") return [];
  return [
    ...new Set(
      code.split(",").flatMap((part) => {
        if (part.includes("-")) {
          const [s, e] = part.split("-").map((n) => parseInt(n, 10));
          return isNaN(s) || isNaN(e)
            ? []
            : Array.from({ length: e - s + 1 }, (_, i) => s + i);
        }
        const num = parseInt(part, 10);
        return isNaN(num) || num <= 0 ? [] : [num];
      })
    ),
  ].sort((a, b) => a - b);
};

interface RaffleConfig {
  raffleId: string;
  userId: string;
  tickets: number[];
  salt?: string;
}

interface DecodedReference {
  raffleId: string;
  userId: string;
  tickets: number[];
  salt: string;
  generatedAt: Date;
}

export const generateRaffleReference = (config: RaffleConfig): string => {
  const salt = config.salt || genSalt();
  const data = `${config.raffleId}|${config.userId}|${compactTickets(
    config.tickets
  )}|${salt}`;
  const dataWithCheck = `${data}|${checksum(data)}`;
  return b62Encode(pako.deflate(dataWithCheck, { level: 9 }));
};

export const decodeRaffleReference = (ref: string): DecodedReference | null => {
  try {
    const parts = pako.inflate(b62Decode(ref), { to: "string" }).split("|");
    if (parts.length !== 5) return null;

    const [raffleId, userId, ticketsCode, salt, check] = parts;
    if (!raffleId || !userId || !salt || !/^\d$/.test(check)) return null;

    const expectedCheck = checksum(
      `${raffleId}|${userId}|${ticketsCode}|${salt}`
    );
    if (parseInt(check) !== expectedCheck) return null;

    const timestamp = parseInt(salt.slice(0, -6), 36);
    return {
      raffleId,
      userId,
      tickets: parseTickets(ticketsCode),
      salt,
      generatedAt: new Date(timestamp || 0),
    };
  } catch {
    return null;
  }
};

export const validateReference = (ref: string): boolean =>
  !!decodeRaffleReference(ref);

export const getStats = (config: RaffleConfig) => {
  const salt = config.salt || genSalt();
  const data = `${config.raffleId}|${config.userId}|${compactTickets(
    config.tickets
  )}|${salt}`;
  const withCheck = `${data}|${checksum(data)}`;
  const compressed = pako.deflate(withCheck, { level: 9 });

  return {
    originalSize: new TextEncoder().encode(withCheck).length,
    compressedSize: compressed.length,
    compressionRatio:
      compressed.length / new TextEncoder().encode(withCheck).length,
    reference: b62Encode(compressed),
  };
};

export const validateConfig = (config: RaffleConfig) => {
  const errors: string[] = [];
  if (!config.raffleId?.trim()) errors.push("raffleId requerido");
  if (!config.userId?.trim()) errors.push("userId requerido");
  if (!Array.isArray(config.tickets) || !config.tickets.length)
    errors.push("tickets requerido");
  if (config.salt !== undefined && !config.salt?.trim())
    errors.push("salt inválido");
  return { isValid: !errors.length, errors };
};

export const generateBatch = async (
  configs: Omit<RaffleConfig, "salt">[],
  delay = 1
) => {
  const results: Array<{ config: RaffleConfig; reference: string }> = [];
  for (const cfg of configs) {
    const config = { ...cfg, salt: genSalt() };
    results.push({ config, reference: generateRaffleReference(config) });
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  }
  return results;
};

export const getReferenceInfo = (ref: string) => {
  const decoded = decodeRaffleReference(ref);
  if (!decoded) return { isValid: false, error: "Referencia inválida" };

  const ageMs = Date.now() - decoded.generatedAt.getTime();
  const [days, hours, mins] = [
    Math.floor(ageMs / 86400000),
    Math.floor(ageMs / 3600000) % 24,
    Math.floor(ageMs / 60000) % 60,
  ];
  const age =
    days > 0
      ? `${days}d`
      : hours > 0
      ? `${hours}h`
      : mins > 0
      ? `${mins}m`
      : "<1m";

  return { isValid: true, data: decoded, age };
};
