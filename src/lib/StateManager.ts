import { URLManager } from "./URLManager";
import LZString from "lz-string";
import * as URLON from "urlon";

export class StateManager {
  private namespace: string;
  private state: any;
  private listeners = new Set<Function>();
  private unlisten: any;
  private useHash: boolean;
  private useCompression: boolean;

  constructor({
    namespace = "state",
    initialState = {},
    serializedState = null,
    useHash = false,
    useCompression = true,
  } = {}) {
    this.namespace = namespace;
    this.useHash = useHash;
    this.useCompression = useCompression;

    this.state = serializedState
      ? this.deserialize(serializedState) || initialState
      : this.getFromURL() || initialState;

    this.unlisten = URLManager.listenURLChanges(() => {
      const newState = this.getFromURL();
      if (newState) {
        this.state = newState;
        this.notifyListeners();
      }
    });
  }

  getState() {
    return { ...this.state };
  }

  setState(updater: any, replace = false) {
    this.state =
      typeof updater === "function"
        ? updater(this.state)
        : { ...this.state, ...updater };
    this.updateURL(replace);
    this.notifyListeners();
    return this.state;
  }

  setSerializedState(serializedState: string, replace = false) {
    const newState = this.deserialize(serializedState);
    if (newState && typeof newState === "object" && !Array.isArray(newState)) {
      this.state = newState;
      this.updateURL(replace);
      this.notifyListeners();
    }
    return this.state;
  }

  getSerializedState(): string {
    return this.serialize(this.state);
  }

  subscribe(listener: Function) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resetState(replace = true) {
    this.state = {};
    this.updateURL(replace);
    this.notifyListeners();
    return this.state;
  }

  destroy() {
    this.unlisten?.();
    this.listeners.clear();
  }

  createSelector(selector: Function) {
    return () => selector(this.getState());
  }

  private serialize(value: any): string {
    if (typeof value === "string" || !value) return String(value);

    const serialized = URLON.stringify(value);

    if (this.useCompression && LZString?.compressToEncodedURIComponent) {
      return LZString.compressToEncodedURIComponent(serialized);
    }

    return serialized;
  }

  private deserialize(value: string): any {
    if (!value) return value;

    try {
      // Intentar descompresión primero si está habilitada
      if (this.useCompression && LZString?.decompressFromEncodedURIComponent) {
        const decompressed = LZString.decompressFromEncodedURIComponent(value);
        if (decompressed) {
          return URLON.parse(decompressed);
        }
      }

      // Deserializar sin compresión
      return URLON.parse(value);
    } catch {
      return value;
    }
  }

  private getFromURL() {
    const url = URLManager.getURL();
    if (!url) return null;

    try {
      const stateParam = this.useHash
        ? new URLSearchParams(url.hash.replace("#", "")).get(this.namespace)
        : url.params[this.namespace];

      if (!stateParam) return null;

      const state = this.deserialize(stateParam);
      return state && typeof state === "object" && !Array.isArray(state)
        ? state
        : null;
    } catch {
      return null;
    }
  }

  private updateURL(replace = false) {
    try {
      const stateStr = this.serialize(this.state);

      if (this.useHash) {
        const url = URLManager.getURL();
        if (!url) return;

        const hashParams = new URLSearchParams(url.hash.replace("#", ""));
        hashParams.set(this.namespace, stateStr);

        URLManager.updateURL({ hash: hashParams.toString(), replace });
      } else {
        const currentParams = URLManager.getURL()?.params || {};
        URLManager.updateURL({
          params: { ...currentParams, [this.namespace]: stateStr },
          replace,
        });
      }
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  static create(options = {}) {
    return new StateManager(options);
  }

  static deserializeState(state: string) {
    return new StateManager().deserialize(state);
  }
}
