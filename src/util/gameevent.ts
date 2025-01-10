type EventHandler = (...args: any) => void;

/** Handles connection handlers to events and firing. */
export class GameEvent {
  /** A map of handlers connected to the event for different keys. */
  private handlers: Map<any, Set<EventHandler>> = new Map();

  /**
   * Connects the handler to an event with an optional key.
   * @param handler The handler function.
   * @param key The event key.
   * @returns The event connection.
   */
  public connect(handler: EventHandler, key: any = "default"): EventConnection {
    const handlers: Set<EventHandler> = this.handlers.get(key) || new Set();
    if (handlers.size === 0) this.handlers.set(key, handlers);

    handlers.add(handler);

    return new EventConnection(this, handler, key);
  }

  /**
   * Connects the handler to an event with an optional key so that it disconnects automatically after being fired.
   * @param handler The handler function.
   * @param key The event key.
   * @returns The event connection.
   */
  public connectOnce(handler: EventHandler, key: any = "default"): EventConnection {
    const wrapper = (...args: any) => {
      handler(...args);

      this.disconnect(wrapper, key);
    }

    return this.connect(wrapper, key);
  }

  /**
   * Disconnects an existing handler and its key from the event.
   * @param handler The handler function.
   * @param key The event key.
   */
  public disconnect(handler: EventHandler, key: any = "default"): void {
    const handlers: Set<EventHandler> | undefined = this.handlers.get(key);
    if (!handlers) return;

    handlers.delete(handler);

    if (handlers.size === 0) this.handlers.delete(key);
  }

  /**
   * Checks whether or not a handler and its key are connected to the event.
   * @param handler The handler function.
   * @param key The event key.
   * @returns True if connected, false if not.
   */
  public isConnected(handler: EventHandler, key: any = "default"): boolean {
    const handlers: Set<EventHandler> | undefined = this.handlers.get(key);
    if (!handlers) return false;

    return handlers.has(handler);
  }

  /**
   * Fires the event with a key, calling all connected handlers for that key.
   * @param key The event key.
   * @param args The arguments to pass to the handlers.
   */
  public fire(key: any = "default", ...args: any): void {
    const handlers: Set<EventHandler> | undefined = this.handlers.get(key);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(...args);
    }
  }
}

/** Handles and manages event connections. */
export class EventConnection {
  private _active: boolean = true;
  
  constructor(private event: GameEvent, private handler: EventHandler, private key: any) {}

  public get active(): boolean {
    if (this._active && !this.event.isConnected(this.handler)) {
      this._active = false;
    }

    return this._active;
  }
  
  /** Disconnects the connection"s handler from the associated event. */
  public disconnect(): void {
    if (!this._active) return;
    this._active = false;

    this.event.disconnect(this.handler, this.key);
  }
}