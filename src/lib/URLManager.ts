/**
 * URLManager - Sistema para gestionar URLs agnóstico a frameworks
 */

interface updateURLParams {
  pathname?: string;
  params?: { [key: string]: string };
  hash?: string;
  replace?: boolean;
}

interface buildURLParams {
  pathname?: string;
  params?: { [key: string]: string };
  hash?: string;
  baseURL?: string;
}
export class URLManager {
  static getURL() {
    // Verificar si estamos en un entorno de navegador
    if (typeof window === "undefined") {
      return null; // Manejar SSR (Server-Side Rendering)
    }

    const url = new URL(window.location.href);

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

  static updateURL({
    pathname,
    params = {},
    hash = "",
    replace = false,
  }: updateURLParams) {
    // Verificar si estamos en un entorno de navegador
    if (typeof window === "undefined") {
      return null; // Manejar SSR
    }

    const url = new URL(window.location.href);

    if (pathname !== undefined) {
      url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
    }

    if (params) {
      // Agregar nuevos parámetros
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.set(key, value);
        } else {
          url.searchParams.delete(key);
        }
      });
    }

    if (hash !== undefined) {
      url.hash = hash.startsWith("#") ? hash : `#${hash}`;
    }

    if (replace) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }

    return url.toString();
  }

  static buildURL({
    pathname = "/",
    params = {},
    hash = "",
    baseURL,
  }: buildURLParams) {
    // Verificar si estamos en un entorno de navegador
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL(baseURL || origin);

    url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });

    if (hash) {
      url.hash = hash.startsWith("#") ? hash : `#${hash}`;
    }

    return url.toString();
  }

  static listenURLChanges(callback: (url: URL) => void) {
    // Verificar si estamos en un entorno de navegador
    if (typeof window === "undefined") {
      return () => {}; // Manejar SSR
    }

    const handlePopState = () => {
      const url = URLManager.getURL();
      if (url) {
        callback(new URL(window.location.href));
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }
}