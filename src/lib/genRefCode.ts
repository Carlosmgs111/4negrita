/**
 * Generador de Referencias Comprimidas para Rifas
 * Formato comprimido: BASE64(COMPRESSED(RAFFLE_ID + USER_ID + TICKETS + CHECK_DIGIT))
 * Usa pako (zlib) para compresión y bibliotecas estándar
 */

// Importar bibliotecas de compresión
import * as pako from 'pako';

// Codificador Base62 para URLs amigables
class Base62Encoder {
  private static readonly CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  static encode(data: Uint8Array): string {
    if (data.length === 0) return '';
    
    // Convertir bytes a un número grande
    let num = 0n;
    for (let i = 0; i < data.length; i++) {
      num = num * 256n + BigInt(data[i]);
    }

    // Convertir a base62
    if (num === 0n) return this.CHARS[0];
    
    let result = '';
    while (num > 0n) {
      result = this.CHARS[Number(num % 62n)] + result;
      num = num / 62n;
    }
    
    return result;
  }

  static decode(encoded: string): Uint8Array {
    if (!encoded) return new Uint8Array(0);
    
    // Convertir de base62 a número
    let num = 0n;
    for (const char of encoded) {
      const index = this.CHARS.indexOf(char);
      if (index === -1) throw new Error('Invalid Base62 character');
      num = num * 62n + BigInt(index);
    }

    // Convertir número a bytes
    if (num === 0n) return new Uint8Array([0]);
    
    const bytes: number[] = [];
    while (num > 0n) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }
    
    return new Uint8Array(bytes);
  }
}

interface RaffleReferenceConfig {
  raffleId: string;
  userId: string;
  tickets: number[];
}

function calculateCheckDigit(input: string): number {
  return input.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 10;
}

function formatTickets(tickets: number[]): string {
  if (!tickets || tickets.length === 0) return '0';
  
  // Validar que todos sean números válidos
  const validTickets = tickets
    .filter(t => Number.isInteger(t) && t > 0)
    .sort((a, b) => a - b);
  
  if (validTickets.length === 0) return '0';
  
  // Compactar rangos consecutivos: [1,2,3,5,7,8,9] -> "1-3,5,7-9"
  const ranges: string[] = [];
  let start = validTickets[0];
  let end = start;
  
  for (let i = 1; i <= validTickets.length; i++) {
    const current = validTickets[i];
    
    if (current === end + 1) {
      end = current;
    } else {
      // Finalizar el rango actual
      if (start === end) {
        ranges.push(start.toString());
      } else if (end === start + 1) {
        ranges.push(`${start},${end}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
      
      if (i < validTickets.length) {
        start = current;
        end = current;
      }
    }
  }
  
  return ranges.join(',');
}

function parseTicketsCode(code: string): number[] {
  if (!code || code === '0') return [];
  
  const tickets: number[] = [];
  const parts = code.split(',');
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          tickets.push(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num > 0) {
        tickets.push(num);
      }
    }
  }
  
  return [...new Set(tickets)].sort((a, b) => a - b);
}

export function generateRaffleReference(config: RaffleReferenceConfig): string {
  const raffleCode = config.raffleId;
  const userCode = config.userId;
  const ticketsCode = formatTickets(config.tickets);
  
  const rawData = `${raffleCode}|${userCode}|${ticketsCode}`;
  const checkDigit = calculateCheckDigit(rawData);
  const dataWithCheck = `${rawData}|${checkDigit}`;
  
  // Comprimir usando pako (zlib/deflate)
  const compressed = pako.deflate(dataWithCheck, { 
    level: 9, // Máxima compresión
    strategy: pako.constants.Z_DEFAULT_STRATEGY 
  });
  
  // Codificar en Base62 para URLs amigables
  return Base62Encoder.encode(compressed);
}

export function validateRaffleReference(reference: string): boolean {
  try {
    const decoded = decodeRaffleReference(reference);
    return decoded !== null;
  } catch {
    return false;
  }
}

export function decodeRaffleReference(reference: string): {
  raffleId: string,
  userId: string,
  tickets: number[]
} | null {
  try {
    // Decodificar desde Base62
    const compressed = Base62Encoder.decode(reference);
    
    // Descomprimir usando pako
    const decompressed = pako.inflate(compressed, { to: 'string' });
    
    // Parsear los datos
    const parts = decompressed.split('|');
    if (parts.length !== 4) return null;
    
    const [raffleCode, userCode, ticketsCode, checkStr] = parts;
    
    // Validar formato básico
    if (!raffleCode || !userCode || ticketsCode === undefined || !checkStr) return null;
    if (!/^\d{1}$/.test(checkStr)) return null;
    
    // Verificar checksum
    const dataWithoutCheck = `${raffleCode}|${userCode}|${ticketsCode}`;
    const expectedCheck = calculateCheckDigit(dataWithoutCheck);
    if (parseInt(checkStr, 10) !== expectedCheck) return null;
    
    return {
      raffleId: raffleCode,
      userId: userCode,
      tickets: parseTicketsCode(ticketsCode)
    };
  } catch (error) {
    console.error('Error decoding reference:', error);
    return null;
  }
}

// Función de utilidad para obtener estadísticas de compresión
export function getCompressionStats(config: RaffleReferenceConfig): {
  originalSize: number,
  compressedSize: number,
  compressionRatio: number,
  ticketsCompacted: string,
  reference: string
} {
  const raffleCode = config.raffleId;
  const userCode = config.userId;
  const ticketsCode = formatTickets(config.tickets);
  
  const rawData = `${raffleCode}|${userCode}|${ticketsCode}`;
  const checkDigit = calculateCheckDigit(rawData);
  const dataWithCheck = `${rawData}|${checkDigit}`;
  
  const originalSize = new TextEncoder().encode(dataWithCheck).length;
  const compressed = pako.deflate(dataWithCheck, { level: 9 });
  const reference = Base62Encoder.encode(compressed);
  
  return {
    originalSize,
    compressedSize: compressed.length,
    compressionRatio: compressed.length / originalSize,
    ticketsCompacted: ticketsCode,
    reference
  };
}

// Función auxiliar para validar configuración antes de generar referencia
export function validateConfig(config: RaffleReferenceConfig): {
  isValid: boolean,
  errors: string[]
} {
  const errors: string[] = [];
  
  if (!config.raffleId || typeof config.raffleId !== 'string') {
    errors.push('raffleId debe ser una cadena no vacía');
  }
  
  if (!config.userId || typeof config.userId !== 'string') {
    errors.push('userId debe ser una cadena no vacía');
  }
  
  if (!Array.isArray(config.tickets)) {
    errors.push('tickets debe ser un array de números');
  } else {
    const invalidTickets = config.tickets.filter(t => !Number.isInteger(t) || t <= 0);
    if (invalidTickets.length > 0) {
      errors.push(`Los siguientes tickets no son válidos: ${invalidTickets.join(', ')}`);
    }
    
    if (config.tickets.length === 0) {
      errors.push('Debe incluir al menos un ticket');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Ejemplos de uso:
/*
const config = {
  raffleId: "SUPER2024",
  userId: "JUAN123",
  tickets: [1, 2, 3, 15, 16, 17, 18, 25, 100]
};

// Validar configuración
const validation = validateConfig(config);
if (!validation.isValid) {
  console.error('Errores de configuración:', validation.errors);
} else {
  const reference = generateRaffleReference(config);
  console.log("Referencia generada:", reference);
  
  const decoded = decodeRaffleReference(reference);
  console.log("Datos decodificados:", decoded);
  
  const stats = getCompressionStats(config);
  console.log("Estadísticas de compresión:", stats);
  console.log("Tickets compactados:", stats.ticketsCompacted); // "1-3,15-18,25,100"
}
*/