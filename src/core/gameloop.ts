export abstract class Gameloop {
  private _running: boolean = false;
  private lastTime: number;
  private _fps: number;

  protected start(time?: number): void {
    this._running = true;

    requestAnimationFrame((timestamp: number) => {
      this.loop(timestamp);
    });
  }

  private loop(timestamp: number): void {
    if (!this._running) return;

    let deltaTime = 0;

    if (this.lastTime) {
      deltaTime = (timestamp - this.lastTime) / 1000;
    }

    // possibly enforce 60fps to maintain performance with high framerate
    this._fps = 1 / deltaTime;
    this.update(deltaTime);
    this.render();

    this.lastTime = timestamp;

    requestAnimationFrame((timestamp: number) => {
      this.loop(timestamp);
    });
  }

  public get running(): boolean {
    return this._running;
  }

  public get fps(): number {
    return this._fps;
  }

  protected stop(): void {
    this._running = false;
  }

  protected abstract update(deltaTime: number): void;
  protected abstract render(): void;
}
