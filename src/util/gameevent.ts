type EventHandler = (...args: any) => void;

export class GameEvent {
  private handlers: Map<any, Set<EventHandler>> = new Map();

  public connect(handler: EventHandler, key: any = "default"): EventConnection {
    const handlers: Set<EventHandler> = this.handlers.get(key) || new Set();
    if (handlers.size === 0) this.handlers.set(key, handlers);

    handlers.add(handler);

    return new EventConnection(this, handler, key);
  }

  public connectOnce(handler: EventHandler, key: any = "default"): EventConnection {
    const wrapper = (...args: any) => {
      handler(...args);

      this.disconnect(wrapper, key);
    }

    return this.connect(wrapper, key);
  }

  public wait(key: any = "default"): Promise<any[]> {
    return new Promise((resolve) => {
      this.connectOnce((...args: any) => {
        resolve(args);

      }, key);
    })
  }

  public disconnect(handler: EventHandler, key: any = "default"): void {
    const handlers: Set<EventHandler> | undefined = this.handlers.get(key);
    if (!handlers) return;

    handlers.delete(handler);

    if (handlers.size === 0) this.handlers.delete(key);
  }

  public fire(key: any = "default", ...args: any): void {
    const handlers = this.handlers.get(key);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(...args);
    }
  }
}

export class EventConnection {
  private _active: boolean = true; // fix active not disabling for connectOnce or manual disconnect

  constructor(private event: GameEvent, private handler: EventHandler, private key: any) {}

  public get active(): boolean {
    return this._active;
  }

  public disconnect(): void {
    this._active = false;

    this.event.disconnect(this.handler, this.key);
  }
}