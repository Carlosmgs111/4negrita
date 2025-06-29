/**
 * URLManager - Sistema para gestionar URLs agnóstico a frameworks con soporte completo para SSR
 */

interface UpdateURLParams {
  pathname?: string;
  params?: { [key: string]: string | null | undefined };
  hash?: string;
  replace?: boolean;
}

interface BuildURLParams {
  pathname?: string;
  params?: { [key: string]: string | null | undefined };
  hash?: string;
  baseURL?: string;
}

interface URLInfo {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: { [key: string]: string };
  toString: () => string;
}

export class URLManager {
  private static isClient = (): boolean => 
    typeof window !== "undefined" && typeof window.location !== "undefined";

  private static getDefaultURL = (): string => "http://localhost:3000/";

  private static createURLInfo(url: URL): URLInfo {
    return {
      protocol: url.protocol.replace(":", ""),
      host: url.host,
      hostname: url.hostname,
      port: url.port || "",
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: Object.fromEntries(url.searchParams),
      toString: () => url.toString(),
    };
  }

  /**
   * Obtiene la información de la URL actual
   */
  static getURL(fallbackURL?: string): URLInfo | null {
    const urlString = this.isClient() 
      ? window.location.href 
      : fallbackURL || null;

    if (!urlString) return null;

    try {
      return this.createURLInfo(new URL(urlString));
    } catch {
      console.log("URLManager: Error parsing URL");
      return null;
    }
  }

  /**
   * Actualiza la URL del navegador
   */
  static updateURL(params: UpdateURLParams): string | null {
    if (!this.isClient()) {
      console.log("URLManager.updateURL: Solo disponible en cliente");
      return null;
    }

    try {
      const url = new URL(window.location.href);
      const { pathname, params: urlParams = {}, hash = "", replace = false } = params;

      if (pathname !== undefined) {
        url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
      }

      Object.entries(urlParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        } else {
          url.searchParams.delete(key);
        }
      });

      if (hash !== undefined) {
        url.hash = hash === "" ? "" : hash.startsWith("#") ? hash : `#${hash}`;
      }

      const newURL = url.toString();
      
      if (replace) {
        window.history.replaceState({}, "", newURL);
      } else {
        window.history.pushState({}, "", newURL);
      }

      return newURL;
    } catch {
      console.log("URLManager.updateURL: Error actualizando URL");
      return null;
    }
  }

  /**
   * Construye una URL completa
   */
  static buildURL(params: BuildURLParams): string {
    const { pathname = "/", params: urlParams = {}, hash = "", baseURL } = params;

    try {
      const origin = baseURL || (this.isClient() ? window.location.origin : this.getDefaultURL());
      const url = new URL(origin);
      
      url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

      Object.entries(urlParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });

      if (hash) {
        url.hash = hash.startsWith("#") ? hash : `#${hash}`;
      }

      return url.toString();
    } catch {
      console.log("URLManager.buildURL: Error construyendo URL");
      return this.getDefaultURL();
    }
  }

  /**
   * Escucha cambios en la URL
   */
  static listenURLChanges(callback: (url: URL) => void): () => void {
    if (!this.isClient()) {
      console.log("URLManager.listenURLChanges: Solo disponible en cliente");
      return () => {};
    }

    const handleChange = () => {
      try {
        callback(new URL(window.location.href));
      } catch {
        console.log("URLManager.listenURLChanges: Error en callback");
      }
    };

    const handlePopState = () => handleChange();
    const handlePushState = () => setTimeout(handleChange, 0);

    window.addEventListener("popstate", handlePopState);
    
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handlePushState();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handlePushState();
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }

  /**
   * Navega a una URL específica
   */
  static navigate(url: string, replace: boolean = false): boolean {
    if (!this.isClient()) {
      console.log("URLManager.navigate: Solo disponible en cliente");
      return false;
    }

    try {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
      return true;
    } catch {
      console.log("URLManager.navigate: Error navegando");
      return false;
    }
  }

  /**
   * Obtiene un parámetro específico de la URL
   */
  static getParam(key: string, fallbackURL?: string): string | null {
    const urlInfo = this.getURL(fallbackURL);
    return urlInfo?.params[key] || null;
  }

  /**
   * Verifica si estamos en el cliente
   */
  static isClientSide = (): boolean => this.isClient();

  /**
   * Parsea una URL string y devuelve información estructurada
   */
  static parseURL(urlString: string): URLInfo | null {
    try {
      return this.createURLInfo(new URL(urlString));
    } catch {
      console.log("URLManager.parseURL: Error parseando URL");
      return null;
    }
  }
}

// Hook personalizado para React
export function useURLManager(fallbackURL?: string) {
  const isClient = URLManager.isClientSide();
  
  return {
    urlInfo: URLManager.getURL(fallbackURL),
    updateURL: URLManager.updateURL,
    isClient,
  };
}