export class Tool {
  private timePassed: number = 0;
  private debounce: boolean = false;

  constructor(
    private name: string,
    private cooldown: number = 0,
  ) {}

  public update(deltaTime: number) {
    if (this.debounce) {
      this.timePassed += deltaTime;

      if (this.timePassed >= this.cooldown) {
        this.debounce = false;
        this.timePassed = 0;
      }
    }
  }

  public use(): void {
    if (this.debounce) return;

    this.debounce = true;

    console.log("ATTACKED!!");
  }
}
