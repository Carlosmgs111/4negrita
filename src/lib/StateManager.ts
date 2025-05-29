import { URLManager } from "./URLManager";
import LZString from "lz-string";
import * as URLON from "urlon";

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
   * @property {string} [serializedState] - Estado ya serializado para inicializar directamente desde URL
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
    serializedState = null,
    serializer = URLON.stringify,
    deserializer = URLON.parse,
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

    // Verificar disponibilidad de LZString al inicializar
    this.checkLZStringAvailability();

    // Priorizar estado serializado si se proporciona
    if (serializedState) {
      this.state = this.deserializeValue(serializedState) || this.initialState;
    } else {
      // Inicializar estado desde URL o usar el inicial
      this.state = this.getStateFromURL() || this.initialState;
    }

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
    this.updateURLWithState(replace);
    this.notifyListeners();
    return this.state;
  }

  /**
   * Establece el estado desde un valor ya serializado
   * @param {string} serializedState - Estado serializado (como se obtiene de la URL)
   * @param {boolean} [replace=false] - Si debe reemplazar la entrada en el historial
   * @returns {Object} El nuevo estado deserializado
   */
  setSerializedState(serializedState: string, replace = false) {
    try {
      const deserializedState = this.deserializeValue(serializedState);
      
      if (deserializedState && typeof deserializedState === 'object' && !Array.isArray(deserializedState)) {
        if (!this.isStringAsObject(deserializedState)) {
          this.state = deserializedState;
          this.updateURLWithState(replace);
          this.notifyListeners();
          return this.state;
        }
      }
      return this.state;
    } catch (error) {
      return this.state;
    }
  }

  /**
   * Obtiene el estado actual en formato serializado
   * @returns {string} Estado actual serializado
   */
  getSerializedState(): string {
    return this.serializeValue(this.state);
  }

  /**
   * Suscribe un listener para cambios de estado
   * @param {Function} listener - Función a llamar cuando cambia el estado
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribe(listener: Function) {
    this.listeners.add(listener);
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
   * Verifica la disponibilidad de LZString y sus métodos
   * @private
   */
  private checkLZStringAvailability() {
    if (LZString) {
    }
  }

  /**
   * Determina si un valor debe ser serializado o no
   * @private
   * @param {any} value - Valor a comprobar
   * @returns {boolean} true si debe ser serializado, false si no
   */
  private shouldSerialize(value: any): boolean {
    if (typeof value === "string") return false;
    if (value === null || value === undefined) return false;
    return true;
  }

  /**
   * Serializa un valor si es necesario
   * @private
   * @param {any} value - Valor a serializar
   * @returns {string} Valor serializado
   */
  private serializeValue(value: any): string {
    if (!this.shouldSerialize(value)) {
      return String(value);
    }
    const serialized = this.serializer(value);

    if (this.useCompression) {
      // Verificar que LZString y el método estén disponibles
      if (LZString && typeof LZString.compressToEncodedURIComponent === 'function') {
        const compressed = LZString.compressToEncodedURIComponent(serialized);
        return compressed;
      }
    }

    return serialized;
  }

  /**
   * Intenta deserializar un valor si es necesario
   * @private
   * @param {string} value - Valor a deserializar
   * @returns {any} Valor deserializado
   */
  private deserializeValue(value: string): any {
    if (!value) return value;

    // Primero, intentar deserializar con compresión si está habilitada
    if (this.useCompression) {
      try {
        // Verificar que LZString y el método estén disponibles
        if (LZString && typeof LZString.decompressFromEncodedURIComponent === 'function') {
          const decompressed = LZString.decompressFromEncodedURIComponent(value);
          
          if (decompressed !== null && decompressed !== undefined && decompressed !== "") {
            try {
              const result = this.deserializer(decompressed);
              return result;
            } catch (deserializationError) {
              console.warn("Error deserializando valor descomprimido:", deserializationError);
            }
          }
        } else {
          console.warn("LZString.decompressFromEncodedURIComponent no está disponible");
        }
      } catch (decompressionError) {
        console.warn("Error en descompresión:", decompressionError);
      }
    }

    // Si llegamos aquí, intentar deserializar sin compresión
    try {
      const result = this.deserializer(value);
      return result;
    } catch (deserializationError) {
      
      // Si todo falla, verificar si es un valor que parece ser URLON mal formado
      // y intentar recuperar el estado inicial en su lugar
      if (typeof value === 'string' && value.includes('@:') && value.includes('&:')) {
        console.warn("Valor parece ser URLON corrupto, usando estado inicial");
        return this.initialState;
      }
      
      return value;
    }
  }

  static deserializeState(state: string) {
    const stateManager = new StateManager();
    return stateManager.deserializeValue(state);
  }

  /**
   * Obtiene el estado desde la URL
   * @private
   * @returns {Object|null} Estado deserializado o null si no hay estado en la URL
   */
  private getStateFromURL() {
    const url = URLManager.getURL();

    if (!url) return null;

    try {
      let stateParam;
      
      if (this.useHash) {
        const hash = url.hash.startsWith("#")
          ? url.hash.substring(1)
          : url.hash;
        if (!hash) return null;

        const hashParams = new URLSearchParams(hash);
        stateParam = hashParams.get(this.namespace);
      } else {
        stateParam = url.params[this.namespace];
      }

      if (!stateParam) return null;
      
      const deserializedState = this.deserializeValue(stateParam);
      
      // Validar que el estado deserializado sea un objeto válido
      if (deserializedState && typeof deserializedState === 'object' && !Array.isArray(deserializedState)) {
        // Verificar que no sea un string convertido a objeto (como tu problema)
        if (!this.isStringAsObject(deserializedState)) {
          return deserializedState;
        }
      }
      
      return this.initialState;
      
    } catch (error) {
      return this.initialState;
    }
  }

  /**
   * Verifica si un objeto es realmente un string convertido a objeto
   * @private
   * @param {any} obj - Objeto a verificar
   * @returns {boolean} true si es un string convertido a objeto
   */
  private isStringAsObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Verificar si tiene propiedades numéricas secuenciales como un string
    const keys = Object.keys(obj);
    const hasNumericKeys = keys.some(key => /^\d+$/.test(key));
    
    // Si tiene claves numéricas y alguna clave con caracteres especiales de URLON
    if (hasNumericKeys) {
      const stringified = JSON.stringify(obj);
      return stringified.includes('"@"') || stringified.includes('"&"') || stringified.includes('":"');
    }
    return false;
  }

  /**
   * Actualiza la URL con el estado actual
   * @private
   * @param {boolean} replace - Si debe reemplazar la entrada en el historial
   */
  private updateURLWithState(replace = false) {
    try {
      const stateStr = this.serializeValue(this.state);

      if (this.useHash) {
        const url = URLManager.getURL();

        if (!url) {
          return;
        }

        const hashParams = new URLSearchParams(
          url.hash.startsWith("#") ? url.hash.substring(1) : url.hash
        );
        hashParams.set(this.namespace, stateStr);

        URLManager.updateURL({
          hash: hashParams.toString(),
          replace,
        });
      } else {
        const currentURL = URLManager.getURL();
        const currentParams = currentURL ? currentURL.params : {};

        const newParams = {
          ...currentParams,
          [this.namespace]: stateStr,
        };

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
   * Crea una instancia de URLStateManager o recupera el estado existente
   * @param {StateOptions} options - Opciones de configuración
   * @returns {URLStateManager} Instancia del gestor de estado
   */
  static create(options = {}) {
    return new StateManager(options);
  }
}