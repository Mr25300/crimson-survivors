/** Handle game loop */
export abstract class Gameloop {
  private _running: boolean = false;
  private lastTime: number;
  private _elapsedTime: number = 0;
  private _fps: number;
  
  protected start(): void {
    this._running = true;

    requestAnimationFrame((timestamp: number) => {
      this.loop(timestamp);
    });
  }

  /**
   * Handles the gameloop frame.
   * @param timestamp The animation frame timestamp in milliseconds.
   */
  private loop(timestamp: number): void {
    if (!this._running) return;

    // Calcualte the change in time from the current and last timestamp
    const deltaTime: number = this.lastTime !== undefined ? (timestamp - this.lastTime) / 1000 : 0;
    this.lastTime = timestamp;

    this._elapsedTime += deltaTime;
    this._fps = 1 / deltaTime;

    // Call update and render functions
    this.update(deltaTime);
    this.render();

    requestAnimationFrame((timestamp: number) => {
      this.loop(timestamp);
    });
  }

  public get running(): boolean {
    return this._running;
  }

  public get elapsedTime(): number {
    return this._elapsedTime;
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
