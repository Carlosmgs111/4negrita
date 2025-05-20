// data-compression-system.ts

/**
 * Sistema genérico de compresión y codificación para datos estructurados
 *
 * Este sistema implementa:
 * 1. Codificación de entidades basada en atributos configurables
 * 2. Generación de cadenas comprimidas para colecciones de datos
 * 3. Descompresión para recuperar la información original
 * 4. Framework extensible para diferentes dominios de aplicación
 */

// Tipos genéricos para el sistema de compresión
interface Entity {
  id: string;
  [key: string]: any;
}

interface CompressedData {
  compressedString: string;
  compressionRatio: number;
  originalLength: number;
  compressedLength: number;
}

interface CodeDictionary {
  [key: string]: string;
}

interface CompressionConfig {
  primaryAttributes: string[];
  secondaryAttributes: string[];
  attributeDictionaries: Record<string, CodeDictionary>;
  valueSeparator: string;
  entitySeparator: string;
  numericalBase?: number;
}

// Clase principal del sistema de compresión de datos
export class SemantCompressor<T extends Entity> {
  // Diccionarios para codificación/decodificación
  private attributeDicts: Record<string, CodeDictionary> = {};

  // Diccionarios inversos para decodificación
  private reverseAttributeDicts: Record<string, CodeDictionary> = {};

  // Configuración del sistema
  private config: CompressionConfig;

  constructor(config: CompressionConfig) {
    this.config = {
      ...config,
      numericalBase: config.numericalBase || 36, // Default a base36
    };

    // Inicializar diccionarios y diccionarios inversos
    for (const [attrName, dict] of Object.entries(
      config.attributeDictionaries
    )) {
      this.attributeDicts[attrName] = dict;
      this.reverseAttributeDicts[attrName] = this.invertDictionary(dict);
    }
  }

  /**
   * Invierte un diccionario para facilitar la descompresión
   */
  private invertDictionary(dict: CodeDictionary): CodeDictionary {
    const inverted: CodeDictionary = {};
    for (const [key, value] of Object.entries(dict)) {
      inverted[value] = key;
    }
    return inverted;
  }

  /**
   * Genera un código para un atributo basado en su valor
   */
  private generateAttributeCode(attribute: string, value: string): string {
    // Si existe en el diccionario, usar ese código
    if (
      this.attributeDicts[attribute] &&
      this.attributeDicts[attribute][value]
    ) {
      return this.attributeDicts[attribute][value];
    }

    // De lo contrario, generar un código dinámicamente
    return this.abbreviateText(value);
  }

  /**
   * Abrevia un texto para generar un código corto
   */
  private abbreviateText(text: string): string {
    // Estrategia genérica de abreviación
    const words = text.split(" ");
    let code = "";

    // Tomar primera letra de hasta tres palabras
    for (let i = 0; i < Math.min(3, words.length); i++) {
      if (words[i].length > 0) {
        code += words[i][0].toUpperCase();
      }
    }

    // Si una sola palabra, tomar más caracteres
    if (words.length === 1 && words[0].length > 1) {
      code += words[0].slice(1, 3).toUpperCase();
    }

    // Agregar un número basado en la longitud del texto para reducir colisiones
    const textHash = (text.length % 9) + 1;
    code += textHash.toString();

    return code;
  }

  /**
   * Convierte un número a la base configurada para compresión
   */
  private toCustomBase(num: number): string {
    return num.toString(this.config.numericalBase).toUpperCase();
  }

  /**
   * Convierte de la base configurada a número decimal
   */
  private fromCustomBase(str: string): number {
    return parseInt(str, this.config.numericalBase);
  }

  /**
   * Genera un código para una entidad basado en sus atributos primarios
   */
  public generateEntityCode(entity: T): string {
    let code = "";

    // Generar código a partir de los atributos primarios configurados
    for (const attr of this.config.primaryAttributes) {
      if (entity[attr]) {
        if (typeof entity[attr] === "string") {
          code += this.generateAttributeCode(attr, entity[attr]);
        } else if (typeof entity[attr] === "number") {
          code += this.toCustomBase(Math.round(entity[attr] * 100) / 100);
        } else {
          code += String(entity[attr]).substring(0, 3);
        }
      }
    }

    // Limitar longitud para evitar códigos excesivamente largos
    if (code.length > 10) {
      code = code.slice(0, 10);
    }

    return code;
  }

  /**
   * Genera una cadena en formato original para una entidad
   */
  public formatEntityString(entity: T): string {
    const parts: string[] = [];

    // Combinar atributos primarios y secundarios
    const allAttributes = [
      ...this.config.primaryAttributes,
      ...this.config.secondaryAttributes,
    ];

    for (const attr of allAttributes) {
      if (entity[attr] !== undefined) {
        const value = this.formatAttributeValue(attr, entity[attr]);
        parts.push(`${attr}:${value}`);
      }
    }

    return parts.join(this.config.valueSeparator);
  }

  /**
   * Formatea el valor de un atributo según su tipo
   */
  private formatAttributeValue(attr: string, value: any): string {
    if (typeof value === "number") {
      // Formatear números con dos decimales si tienen parte decimal
      return value % 1 === 0 ? value.toString() : value.toFixed(2);
    } else {
      return String(value);
    }
  }

  /**
   * Genera una cadena comprimida para una entidad
   */
  public compressEntity(entity: T): string {
    const parts: string[] = [];

    // Codificar atributos primarios
    for (const attr of this.config.primaryAttributes) {
      if (entity[attr] !== undefined) {
        let code: string;

        if (typeof entity[attr] === "string") {
          code =
            this.attributeDicts[attr]?.[entity[attr]] ||
            this.abbreviateText(entity[attr]);
        } else if (typeof entity[attr] === "number") {
          // Convertir números a base personalizada para ahorrar caracteres
          code = this.toCustomBase(Math.round(entity[attr] * 100));
        } else {
          code = String(entity[attr]).substring(0, 2);
        }

        parts.push(code);
      }
    }

    // Codificar atributos secundarios (solo si son relevantes)
    for (const attr of this.config.secondaryAttributes) {
      if (entity[attr] !== undefined) {
        let code: string;

        if (typeof entity[attr] === "string") {
          code =
            this.attributeDicts[attr]?.[entity[attr]] ||
            this.abbreviateText(entity[attr]);
        } else if (typeof entity[attr] === "number") {
          code = this.toCustomBase(Math.round(entity[attr] * 100));
        } else {
          code = String(entity[attr]).substring(0, 2);
        }

        parts.push(code);
      }
    }

    return parts.join("");
  }

  /**
   * Comprime una colección de entidades
   */
  public compressCollection(entities: T[]): CompressedData {
    // Formato original para comparación
    const originalFormat = entities
      .map((e) => this.formatEntityString(e))
      .join(this.config.entitySeparator);

    // Formato comprimido
    const compressedFormat = entities
      .map((e) => this.compressEntity(e))
      .join(this.config.valueSeparator);

    return {
      compressedString: compressedFormat,
      originalLength: originalFormat.length,
      compressedLength: compressedFormat.length,
      compressionRatio:
        (1 - compressedFormat.length / originalFormat.length) * 100,
    };
  }

  /**
   * Descomprime una cadena comprimida a entidades originales (mejor esfuerzo)
   * Para una descompresión completa, normalmente se requiere un esquema
   */
  public decompressToEntities(
    compressedString: string,
    schema: Record<string, string>
  ): Partial<T>[] {
    const compressedEntities = compressedString.split(
      this.config.valueSeparator
    );
    const entities: Partial<T>[] = [];

    for (const compressedEntity of compressedEntities) {
      try {
        const entity: Partial<T> = {} as Partial<T>;
        let currentPos = 0;

        // Extraer valores basados en el esquema proporcionado
        for (const [attrName, pattern] of Object.entries(schema)) {
          const match = compressedEntity
            .substring(currentPos)
            .match(new RegExp(`^(${pattern})`));

          if (match && match[1]) {
            const rawValue = match[1];
            currentPos += rawValue.length;

            // Procesar el valor según el tipo esperado
            if (
              this.reverseAttributeDicts[attrName] &&
              this.reverseAttributeDicts[attrName][rawValue]
            ) {
              // Es un valor codificado con diccionario
              entity[attrName as keyof T] = this.reverseAttributeDicts[
                attrName
              ][rawValue] as any;
            } else if (/^[0-9A-Z]+$/.test(rawValue)) {
              // Posiblemente un número en base personalizada
              try {
                const numValue = this.fromCustomBase(rawValue) / 100;
                entity[attrName as keyof T] = numValue as any;
              } catch (e) {
                entity[attrName as keyof T] = rawValue as any;
              }
            } else {
              entity[attrName as keyof T] = rawValue as any;
            }
          }
        }

        entities.push(entity);
      } catch (error) {
        console.error(`Error descomprimiendo: ${compressedEntity}`, error);
      }
    }

    return entities;
  }
}
