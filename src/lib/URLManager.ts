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
  private static isClient(): boolean {
    return typeof window !== "undefined" && typeof window.location !== "undefined";
  }

  private static getDefaultURL(): string {
    return "http://localhost:3000/";
  }

  /**
   * Obtiene la información de la URL actual
   * En SSR, devuelve información por defecto o la URL proporcionada
   */
  static getURL(fallbackURL?: string): URLInfo | null {
    let urlString: string;

    if (this.isClient()) {
      urlString = window.location.href;
    } else if (fallbackURL) {
      urlString = fallbackURL;
    } else {
      // En SSR sin URL de respaldo, devolvemos null
      return null;
    }

    try {
      const url = new URL(urlString);
      
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
    } catch (error) {
      console.warn("URLManager: Error parsing URL", error);
      return null;
    }
  }

  /**
   * Actualiza la URL del navegador (solo funciona en cliente)
   */
  static updateURL({
    pathname,
    params = {},
    hash = "",
    replace = false,
  }: UpdateURLParams): string | null {
    if (!this.isClient()) {
      console.warn("URLManager.updateURL: No disponible en SSR");
      return null;
    }

    try {
      const url = new URL(window.location.href);

      if (pathname !== undefined) {
        url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
      }

      // Procesar parámetros
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            url.searchParams.set(key, String(value));
          } else {
            url.searchParams.delete(key);
          }
        });
      }

      if (hash !== undefined) {
        if (hash === "") {
          url.hash = "";
        } else {
          url.hash = hash.startsWith("#") ? hash : `#${hash}`;
        }
      }

      const newURL = url.toString();

      if (replace) {
        window.history.replaceState({}, "", newURL);
      } else {
        window.history.pushState({}, "", newURL);
      }

      return newURL;
    } catch (error) {
      console.error("URLManager.updateURL: Error updating URL", error);
      return null;
    }
  }

  /**
   * Construye una URL completa
   * Funciona tanto en cliente como en servidor
   */
  static buildURL({
    pathname = "/",
    params = {},
    hash = "",
    baseURL,
  }: BuildURLParams): string {
    try {
      let origin: string;

      if (baseURL) {
        origin = baseURL;
      } else if (this.isClient()) {
        origin = window.location.origin;
      } else {
        origin = this.getDefaultURL();
      }

      const url = new URL(origin);
      url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

      // Procesar parámetros
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });

      if (hash) {
        url.hash = hash.startsWith("#") ? hash : `#${hash}`;
      }

      return url.toString();
    } catch (error) {
      console.error("URLManager.buildURL: Error building URL", error);
      return this.getDefaultURL();
    }
  }

  /**
   * Escucha cambios en la URL (solo funciona en cliente)
   */
  static listenURLChanges(callback: (url: URL) => void): () => void {
    if (!this.isClient()) {
      console.warn("URLManager.listenURLChanges: No disponible en SSR");
      return () => {};
    }

    const handlePopState = () => {
      try {
        const url = new URL(window.location.href);
        callback(url);
      } catch (error) {
        console.error("URLManager.listenURLChanges: Error in callback", error);
      }
    };

    // También escuchar cambios programáticos
    const handlePushState = () => {
      setTimeout(() => {
        try {
          const url = new URL(window.location.href);
          callback(url);
        } catch (error) {
          console.error("URLManager.listenURLChanges: Error in pushstate callback", error);
        }
      }, 0);
    };

    window.addEventListener("popstate", handlePopState);
    
    // Interceptar pushState y replaceState para detectar cambios programáticos
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

    // Función de limpieza
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }

  /**
   * Navega a una URL específica (solo funciona en cliente)
   */
  static navigate(url: string, replace: boolean = false): boolean {
    if (!this.isClient()) {
      console.warn("URLManager.navigate: No disponible en SSR");
      return false;
    }

    try {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
      return true;
    } catch (error) {
      console.error("URLManager.navigate: Error navigating", error);
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
   * Verifica si estamos en el cliente (útil para componentes)
   */
  static isClientSide(): boolean {
    return this.isClient();
  }

  /**
   * Parsea una URL string y devuelve información estructurada
   */
  static parseURL(urlString: string): URLInfo | null {
    try {
      const url = new URL(urlString);
      
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
    } catch (error) {
      console.warn("URLManager.parseURL: Error parsing URL", error);
      return null;
    }
  }
}

// Hook personalizado para React (opcional)
export function useURLManager(fallbackURL?: string) {
  if (typeof window === "undefined") {
    // En SSR, devolver valores por defecto
    return {
      urlInfo: URLManager.getURL(fallbackURL),
      updateURL: () => null,
      isClient: false,
    };
  }

  return {
    urlInfo: URLManager.getURL(),
    updateURL: URLManager.updateURL,
    isClient: true,
  };
}