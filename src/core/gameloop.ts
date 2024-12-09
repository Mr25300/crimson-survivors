export abstract class Gameloop {
  private running: boolean = false;
  private lastTime: number;

  protected start(time?: number): void {
    this.running = true;

    requestAnimationFrame((timestamp: number) => {
      this.loop(timestamp);
    });
  }

  private loop(timestamp: number): void {
    if (!this.running) return;

    let deltaTime = 0;

    if (this.lastTime) {
      deltaTime = (timestamp - this.lastTime) / 1000;
    }

    // possibly enforce 60fps to maintain performance with high framerate

    this.update(deltaTime);
    this.render();

    this.lastTime = timestamp;

    requestAnimationFrame((timestamp: number) => {
      this.loop(timestamp);
    });
  }

  protected stop(): void {
    this.running = false;
  }

  protected abstract update(deltaTime: number): void;
  protected abstract render(): void;
}
