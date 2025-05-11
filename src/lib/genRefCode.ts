/**
 * Generador de Referencias para Transacciones Financieras
 * Este script genera referencias únicas para transacciones financieras
 * siguiendo un formato específico: TIPO-FECHA-CLIENTE-SECUENCIA-VERIFICACION
 */

// Tipos de transacción disponibles
type TransactionType = 'PAY' | 'INV' | 'REF' | 'DEP' | 'WTH';

// Interfaz para la configuración de la referencia
interface ReferenceConfig {
  transactionType: TransactionType;
  clientId: string;
  amount: number;    // Monto de la transacción
  date?: Date;       // Opcional, usa la fecha actual si no se proporciona
}

/**
 * Calcula un dígito de verificación simple para la referencia
 * @param input - Cadena para calcular el dígito de verificación
 * @returns Un dígito único como resultado de la suma de comprobación
 */
function calculateCheckDigit(input: string): number {
  // Implementa una suma de comprobación simple basada en la suma de los códigos ASCII
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input.charCodeAt(i);
  }
  
  // Retorna un dígito entre 0-9
  return sum % 10;
}

/**
 * Formatea el ID del cliente para asegurar una longitud consistente
 * @param clientId - ID del cliente original
 * @returns ID del cliente formateado
 */
function formatClientId(clientId: string): string {
  // Asegura que el ID del cliente tenga un formato consistente (ej: CL001)
  // Elimina espacios y caracteres especiales
  const cleanId = clientId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Si el ID no comienza con letras, añade un prefijo
  const hasLetterPrefix = /^[A-Z]/.test(cleanId);
  const prefix = hasLetterPrefix ? '' : 'CL';
  
  // Asegura que la parte numérica tenga al menos 3 dígitos
  const numericPart = cleanId.replace(/[^0-9]/g, '');
  const formattedNumeric = numericPart.padStart(3, '0').substring(0, 3);
  
  // Combina la parte alfabética con la numérica
  const alphaPart = cleanId.replace(/[^A-Z]/g, '');
  
  return `${prefix}${alphaPart}${formattedNumeric}`.substring(0, 5);
}

/**
 * Formatea un monto para generar una codificación legible
 * Formato: 
 * - 750 -> 750
 * - 750.5 -> 750.5
 * - 5000 -> 005k
 * - 5500 -> 005.5k
 * - 85000 -> 085k
 * - 1205000 -> 001m.205k
 * @param amount - Monto a formatear
 * @returns Monto formateado según las reglas especificadas
 */
function formatAmount(amount: number): string {
  if (amount < 0) {
    // Para montos negativos, añadimos un prefijo
    return "N" + formatAmount(Math.abs(amount));
  }
  
  // Para montos con decimales, redondeamos a 1 decimal
  const roundedAmount = Math.round(amount * 10) / 10;
  
  if (roundedAmount < 1000) {
    // Montos menores a 1000 - los dejamos tal cual
    return Number.isInteger(roundedAmount) ? 
      roundedAmount.toString() : 
      roundedAmount.toFixed(1);
  } 
  else if (roundedAmount < 1000000) {
    // Montos entre 1,000 y 999,999 (k)
    const thousands = roundedAmount / 1000;
    
    if (Number.isInteger(thousands)) {
      // Sin decimal
      return thousands.toString().padStart(3, '0') + "k";
    } else {
      // Con decimal
      const intPart = Math.floor(thousands).toString().padStart(3, '0');
      const decPart = Math.round((thousands - Math.floor(thousands)) * 10);
      return `${intPart}.${decPart}k`;
    }
  }
  else {
    // Montos de 1,000,000 en adelante (m)
    const millions = Math.floor(roundedAmount / 1000000);
    const remainingThousands = Math.round((roundedAmount % 1000000) / 1000);
    
    if (remainingThousands === 0) {
      // Sin miles adicionales
      return millions.toString().padStart(3, '0') + "m";
    } else {
      // Con miles adicionales
      return `${millions.toString().padStart(3, '0')}m.${remainingThousands.toString().padStart(3, '0')}k`;
    }
  }
}

/**
 * Formatea una fecha en formato AAAAMMDD
 * @param date - Objeto Date a formatear
 * @returns Fecha formateada como string AAAAMMDD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Parsea un código de monto y devuelve el valor numérico
 * @param amountCode - Código del monto (ej: "750", "750.5", "005k", "001m.205k")
 * @returns Valor numérico del monto
 */
function parseAmountCode(amountCode: string): number {
  // Comprobar si es un monto negativo
  let isNegative = false;
  if (amountCode.startsWith('N')) {
    isNegative = true;
    amountCode = amountCode.substring(1);
  }
  
  let amount = 0;
  
  // Procesar millones si existen
  if (amountCode.includes('m')) {
    const parts = amountCode.split('m');
    const millions = parseFloat(parts[0]);
    amount += millions * 1000000;
    
    // Si hay parte decimal después de millones (miles)
    if (parts[1] && parts[1].includes('k')) {
      const kPart = parts[1].substring(parts[1].indexOf('.') + 1);
      const thousands = parseFloat(kPart.replace('k', ''));
      amount += thousands * 1000;
    }
  }
  // Procesar miles si existen
  else if (amountCode.includes('k')) {
    const thousands = parseFloat(amountCode.replace('k', ''));
    amount = thousands * 1000;
  }
  // Monto directo (menos de 1000)
  else {
    amount = parseFloat(amountCode);
  }
  
  return isNegative ? -amount : amount;
}

/**
 * Genera una referencia financiera única
 * @param config - Configuración para la referencia
 * @returns Una cadena de referencia financiera
 */
export function generateFinancialReference(config: ReferenceConfig): string {
  // Usar la fecha actual si no se proporciona una
  const date = config.date || new Date();
  
  // Formatear cada componente
  const typeCode = config.transactionType;
  const dateCode = formatDate(date);
  const clientCode = formatClientId(config.clientId);
  const amountCode = formatAmount(config.amount);
  
  // Combinar los componentes en una referencia preliminar
  const preliminaryRef = `${typeCode}-${dateCode}-${clientCode}-${amountCode}`;
  
  // Calcular y añadir el dígito de verificación
  const checkDigit = calculateCheckDigit(preliminaryRef);
  
  // Retornar la referencia completa
  return `${preliminaryRef}-${checkDigit}`;
}

/**
 * Valida una referencia financiera existente
 * @param reference - Referencia a validar
 * @returns Verdadero si la referencia es válida, falso en caso contrario
 */
export function validateFinancialReference(reference: string): boolean {
  // Verificar el formato general - Ahora más flexible para acomodar códigos de monto variados
  const refParts = reference.split('-');
  if (refParts.length !== 5) {
    return false;
  }
  
  // Validar tipo de transacción
  const typePattern = /^[A-Z]{3}$/;
  if (!typePattern.test(refParts[0])) {
    return false;
  }
  
  // Validar fecha
  const datePattern = /^\d{8}$/;
  if (!datePattern.test(refParts[1])) {
    return false;
  }
  
  // Validar ID de cliente
  const clientPattern = /^[A-Z0-9]{1,5}$/;
  if (!clientPattern.test(refParts[2])) {
    return false;
  }
  
  // Validar código de monto - patrón flexible para acomodar diferentes formatos
  // No validamos el formato exacto sino que verificamos que exista un valor
  if (!refParts[3] || refParts[3] === 'NaN') {
    return false;
  }
  
  // Verificar que el dígito de verificación sea un número
  const checkDigitPattern = /^\d{1}$/;
  if (!checkDigitPattern.test(refParts[4])) {
    return false;
  }
  
  // Extraer el dígito de verificación proporcionado
  const providedCheckDigit = parseInt(refParts[4], 10);
  
  // Calcular el dígito de verificación esperado
  const refWithoutCheck = refParts.slice(0, 4).join('-');
  const calculatedCheckDigit = calculateCheckDigit(refWithoutCheck);
  
  // Comparar los dígitos de verificación
  return providedCheckDigit === calculatedCheckDigit;
}

/**
 * Extrae información de una referencia financiera
 * @param reference - Referencia financiera a decodificar
 * @returns Objeto con información decodificada o null si la referencia es inválida
 */
export function decodeFinancialReference(reference: string): { 
  type: string, 
  date: Date, 
  clientId: string, 
  amount: number 
} | null {
  // Primero validar la referencia
  if (!validateFinancialReference(reference)) {
    return null;
  }
  
  // Extraer componentes
  const parts = reference.split('-');
  const [type, dateStr, clientId, amountCode] = parts;
  
  // Parsear la fecha
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Los meses en JS van de 0-11
  const day = parseInt(dateStr.substring(6, 8), 10);
  const date = new Date(year, month, day);
  
  // Parsear el monto desde el código
  const amount = parseAmountCode(amountCode);
  
  return {
    type,
    date,
    clientId,
    amount
  };
}
