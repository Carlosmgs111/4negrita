import { URLManager } from "./URLManager";
import { LZCompressor } from "./LZCompressor";

export class StateManager {
  namespace: string;
  initialState: any;
  serializer: Function;
  deserializer: Function;
  useHash: boolean;
  useCompression: boolean;
  listeners: Set<any>;
  state: any;
  unlisten: any;
  /**
   * @typedef {Object} StateOptions
   * @property {string} [namespace] - Espacio de nombres para evitar colisiones
   * @property {Object} [initialState] - Estado inicial
   * @property {Function} [serializer] - Función para serializar el estado a la URL
   * @property {Function} [deserializer] - Función para deserializar el estado desde la URL
   * @property {boolean} [useHash=false] - Si debe usar el hash en lugar de params para el estado
   * @property {boolean} [useCompression=true] - Si debe usar compresión para reducir el tamaño de los datos en la URL
   */

  /**
   * @param {StateOptions} options
   */
  constructor({
    namespace = "state",
    initialState = {},
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    useHash = false,
    useCompression = true,
  } = {}) {
    this.namespace = namespace;
    this.initialState = initialState;
    this.serializer = serializer;
    this.deserializer = deserializer;
    this.useHash = useHash;
    this.useCompression = useCompression;
    this.listeners = new Set();

    // Inicializar estado desde URL o usar el inicial
    this.state = this.getStateFromURL() || this.initialState;

    // Configurar listeners para cambios de URL
    this.unlisten = URLManager.listenURLChanges(() => {
      const newState = this.getStateFromURL();
      if (newState) {
        this.state = newState;
        this.notifyListeners();
      }
    });
  }

  /**
   * Obtiene el estado actual
   * @returns {Object} Estado actual
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Actualiza el estado
   * @param {Object|Function} updater - Nuevo estado o función que recibe el estado actual y devuelve el nuevo
   * @param {boolean} [replace=false] - Si debe reemplazar la entrada en el historial
   */
  setState(updater: Object | Function, replace = false) {
    const prevState = this.state;

    if (typeof updater === "function") {
      this.state = updater(prevState);
    } else {
      this.state = { ...prevState, ...updater };
    }

    // Actualizar URL
    this.updateURLWithState(replace);

    // Notificar a los listeners
    this.notifyListeners();

    return this.state;
  }

  /**
   * Suscribe un listener para cambios de estado
   * @param {Function} listener - Función a llamar cuando cambia el estado
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribe(listener: Function) {
    this.listeners.add(listener);

    // Devolver función para cancelar suscripción
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Resetea el estado al inicial
   * @param {boolean} [replace=true] - Si debe reemplazar la entrada en el historial
   */
  resetState(replace = true) {
    this.state = { ...this.initialState };
    this.updateURLWithState(replace);
    this.notifyListeners();
    return this.state;
  }

  /**
   * Destruye el gestor de estado y limpia los listeners
   */
  destroy() {
    if (this.unlisten) {
      this.unlisten();
    }
    this.listeners.clear();
  }

  /**
   * Crea un selector de estado
   * @param {Function} selector - Función que selecciona parte del estado
   * @returns {Function} Función que devuelve la parte seleccionada del estado
   */
  createSelector(selector: Function) {
    return () => selector(this.getState());
  }

  /**
   * Determina si un valor debe ser serializado o no
   * @private
   * @param {any} value - Valor a comprobar
   * @returns {boolean} true si debe ser serializado, false si no
   */
  private shouldSerialize(value: any): boolean {
    // Si es una cadena, no necesita serialización
    if (typeof value === "string") return false;
    // Si es null o undefined, no necesita serialización
    if (value === null || value === undefined) return false;
    // Para otros tipos primitivos o objetos, se debe serializar
    return true;
  }

  /**
   * Serializa un valor si es necesario
   * @private
   * @param {any} value - Valor a serializar
   * @returns {string} Valor serializado
   */
  private serializeValue(value: any): string {
    try {
      // Si no debe ser serializado, convertir a string directamente
      if (!this.shouldSerialize(value)) {
        return String(value);
      }

      // Serializar el valor
      const serialized = this.serializer(value);

      // Aplicar compresión si está activada
      if (this.useCompression) {
        try {
          const compressed = LZCompressor.compressToEncodedURIComponent(serialized);
          // Verificar que la compresión fue exitosa (no debería estar vacía)
          if (!compressed) {
            console.warn("Compresión produjo un valor vacío, usando valor sin comprimir");
            return serialized;
          }
          return compressed;
        } catch (compressionError) {
          console.warn("Error en compresión, usando valor sin comprimir", compressionError);
          // Si falla la compresión, usar el valor serializado sin comprimir pero codificado para URL
          return serialized;
        }
      }

      // Si no usamos compresión, asegurarnos de que el valor es seguro para URL
      return serialized;
    } catch (error) {
      console.error("Error en serializeValue:", error);
      // En caso de error, intentar devolver una cadena segura
      return String(value);
    }
  }

  /**
   * Intenta deserializar un valor si es necesario
   * @private
   * @param {string} value - Valor a deserializar
   * @returns {any} Valor deserializado
   */
  private deserializeValue(value: string): any {
    if (!value) return value;

    try {
      // Si está usando compresión, primero descomprimir
      let processedValue = value;
      
      if (this.useCompression) {
        try {
          // Descomprimir el valor usando LZCompressor
          const decompressedValue = LZCompressor.decompressFromEncodedURIComponent(value);
          
          // Verificar que realmente se descomprimió con éxito
          if (decompressedValue) {
            processedValue = decompressedValue;
          } else {
            console.warn("Descompresión produjo un valor vacío, intentando tratar como valor no comprimido");
            // Intentar decodificar como URL
            processedValue = value;
          }
        } catch (compressionError) {
          console.warn("Error en descompresión, intentando usar el valor decodificado", compressionError);
          // Si falla la descompresión, intentar decodificar el valor como URL
          try {
            processedValue = value;
          } catch (decodeError) {
            console.warn("Error decodificando valor URL:", decodeError);
            processedValue = value; // Usar el valor original como último recurso
          }
        }
      } else {
        // Si no usa compresión, decodificar URL
        try {
          processedValue = value;
        } catch (decodeError) {
          console.warn("Error decodificando valor URL:", decodeError);
          processedValue = value;
        }
      }

      // Luego intentar deserializar
      try {
        return this.deserializer(processedValue);
      } catch (deserializeError) {
        console.warn("Error deserializando valor:", deserializeError, "valor procesado:", processedValue);
        
        // Verificar si el valor procesado ya parece un objeto (esto podría ocurrir si la deserialización se hizo en otro paso)
        if (typeof processedValue === 'object' && processedValue !== null) {
          return processedValue;
        }
        
        // Si ninguno de los intentos anteriores funciona, intentar devolver el valor tal cual
        return value;
      }
    } catch (error) {
      // Si no se puede deserializar, devolver el valor original
      console.warn("Error general en deserializeValue:", error);
      return value;
    }
  }

  /**
   * Obtiene el estado desde la URL
   * @private
   * @returns {Object|null} Estado deserializado o null si no hay estado en la URL
   */
  private getStateFromURL() {
    try {
      const url = URLManager.getURL();
      if (!url) return null;

      let stateParam: string | null = null;

      if (this.useHash) {
        // Obtener estado del hash
        const hash = url.hash && url.hash.startsWith("#")
          ? url.hash.substring(1)
          : url.hash || "";
          
        if (!hash) return null;

        try {
          const hashParams = new URLSearchParams(hash);
          stateParam = hashParams.get(this.namespace);
        } catch (hashError) {
          console.warn("Error parsing hash params:", hashError);
          return null;
        }
      } else {
        // Obtener estado de los parámetros de búsqueda
        stateParam = url.params?.[this.namespace] || null;
      }

      if (!stateParam) return null;
      
      // Intentar deserializar el valor
      try {
        const deserializedState = this.deserializeValue(stateParam);
        
        // Verificar que el resultado es un objeto válido y no el estado corrupto que muestra el error
        if (deserializedState && typeof deserializedState === 'object') {
          // Verificar que no es la cadena JSON representada como objeto (error común)
          const keys = Object.keys(deserializedState);
          if (keys.length > 0 && keys.every(k => !isNaN(Number(k)) && typeof deserializedState[k] === 'string')) {
            // Detectamos el error - intentar recuperar el estado original
            const jsonString = Object.values(deserializedState).join('');
            try {
              return JSON.parse(jsonString);
            } catch (e) {
              console.error("Error reconstruyendo el estado desde cadena de caracteres:", e);
              return null;
            }
          }
          return deserializedState;
        }
        return null;
      } catch (deserializeError) {
        console.error("Error deserializing state:", deserializeError);
        return null;
      }
    } catch (error) {
      console.error("Error getting state from URL:", error);
      return null;
    }
  }

  /**
   * Actualiza la URL con el estado actual
   * @private
   * @param {boolean} replace - Si debe reemplazar la entrada en el historial
   */
  private updateURLWithState(replace = false) {
    try {
      if (!this.state) {
        console.warn("No state to update URL with");
        return;
      }
      
      // Serializar el estado (y comprimir si está habilitado)
      const stateStr = this.serializeValue(this.state);
      
      if (!stateStr) {
        console.warn("Failed to serialize state");
        return;
      }

      const currentURL = URLManager.getURL();
      if (!currentURL) return;

      if (this.useHash) {
        // Actualizar hash
        let hash = currentURL.hash || "";
        if (hash.startsWith("#")) {
          hash = hash.substring(1);
        }

        // Crear nuevos hashParams para evitar problemas con parámetros existentes
        const hashParams = new URLSearchParams(hash);
        hashParams.set(this.namespace, stateStr);

        URLManager.updateURL({
          hash: hashParams.toString(),
          replace,
        });
      } else {
        // Crear una copia de los parámetros actuales para evitar modificaciones in-place
        const newParams = { ...currentURL.params };
        
        // Agregar/actualizar el parámetro del estado
        newParams[this.namespace] = stateStr;
        
        // Actualizar la URL con los nuevos parámetros
        URLManager.updateURL({
          params: newParams,
          replace,
        });
      }
    } catch (error) {
      console.error("Error updating URL with state:", error);
    }
  }

  /**
   * Notifica a todos los listeners sobre cambios en el estado
   * @private
   */
  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  /**
   * Crea una instancia de StateManager o recupera el estado existente
   * @param {StateOptions} options - Opciones de configuración
   * @returns {StateManager} Instancia del gestor de estado
   */
  static create(options = {}) {
    return new StateManager(options);
  }
}