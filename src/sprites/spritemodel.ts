import { Game } from "../core/game.js";
import { ShaderProgram } from "../rendering/shaderprogram.js";
import { Color } from "../util/color.js";
import { Matrix4 } from "../util/matrix4.js";
import { Vector2 } from "../util/vector2.js";
import { AnimationInfo, SpriteSheet } from "./spritesheet.js";

export class SpriteModel {
  private position: Vector2 = new Vector2();
  private rotation: number = 0;

  private tileScale: Vector2;

  private currentCell: number = 0;
  private animations: Map<string, SpriteAnimation> = new Map();

  private highlightColor: Color = new Color(1, 1, 1);
  private highlightOpacity: number = 0;

  constructor(
    private sprite: SpriteSheet,
    private width: number = sprite.width,
    private height: number = sprite.height,
    tiling: boolean = false
  ) {
    const objects = Game.instance.spriteModels.get(sprite) || new Set();

    if (objects.size === 0) Game.instance.spriteModels.set(sprite, objects);

    objects.add(this);

    if (tiling) this.tileScale = new Vector2(this.width / this.sprite.width, this.height / this.sprite.height);
    else this.tileScale = new Vector2(1, 1);
  }

  public setSpriteCell(cellNumber: number): void {
    this.currentCell = cellNumber;
  }

  public playAnimation(name: string, timePassed?: number, speed?: number): SpriteAnimation | null {
    const info = this.sprite.getAnimation(name);

    if (!info) {
      console.error(`Sprite animation ${name} does not exist.`);

      return null;
    }

    const animation = new SpriteAnimation(this, info, timePassed, speed);

    this.animations.set(name, animation);

    return animation;
  }

  public isAnimationPlaying(name: string): boolean {
    return this.animations.get(name) !== undefined;
  }

  public stopAnimation(name: string): void {
    this.animations.delete(name);
  }

  public update(deltaTime: number) {
    let highestPriority: number;
    let selectedAnim: SpriteAnimation | undefined;

    this.animations.forEach((anim: SpriteAnimation, key: string) => {
      if (!anim.active) this.animations.delete(key);

      if (highestPriority === undefined || selectedAnim === undefined || anim.priority >= highestPriority) {
        highestPriority = anim.priority;
        selectedAnim = anim;
      }
    });

    if (selectedAnim !== undefined) {
      selectedAnim.update(deltaTime);
    }
  }

  public setHighlight(color: Color) {
    this.highlightColor = color;
  }

  public setHighlightOpacity(opacity: number) {
    this.highlightOpacity = opacity;
  }

  public setTransformation(position: Vector2, rotation: number): void {
    this.position = position;
    this.rotation = rotation;
  }

  public getTransformation(): Matrix4 {
    return Matrix4.fromTransformation(this.position, this.rotation);
  }

  public bind(): void {
    Game.instance.canvas.shader.setAttribBuffer("textureCoord", this.sprite.coordBuffer, 2, 0, this.currentCell * 2 * 4 * Float32Array.BYTES_PER_ELEMENT);
    
    Game.instance.canvas.shader.setUniformMatrix("spriteScale", Matrix4.fromScale(this.width, this.height));
    Game.instance.canvas.shader.setUniformVector("tileScale", this.tileScale);

    Game.instance.canvas.shader.setUniformMatrix("modelTransform", Matrix4.fromTransformation(this.position, this.rotation));

    Game.instance.canvas.shader.setUniformColor("tintColor", this.highlightColor);
    Game.instance.canvas.shader.setUniformFloat("tintOpacity", this.highlightOpacity);
  }

  public destroy(): void {
    const models = Game.instance.spriteModels.get(this.sprite)!;
    models.delete(this);

    if (models.size === 0) {
      Game.instance.spriteModels.delete(this.sprite);
    }
  }
}

export class SpriteAnimation {
  private markerCallbacks: Map<string, () => any> = new Map();

  private _active = true;

  constructor(
    private model: SpriteModel,
    private info: AnimationInfo,
    private timePassed: number = 0,
    private speed: number = 1
  ) {}

  public get active(): boolean {
    return this._active;
  }

  public get priority(): number {
    return this.info.priority;
  }

  public update(deltaTime: number): void {
    const prevTime = this.timePassed;
    const newTime = prevTime + deltaTime * this.speed;

    this.timePassed = newTime;

    if (newTime > this.info.duration) {
      if (!this.info.looped) this.stop();

      this.timePassed %= this.info.duration;
    }

    const percentThrough = this.timePassed / this.info.duration;
    const frameIndex = Math.floor(this.info.frames.length * percentThrough);

    this.model.setSpriteCell(this.info.frames[frameIndex]);

    this.markerCallbacks.forEach((callback: () => any, name: string) => {
      const frame = this.info.getMarker(name)!;
      const frameTime = frame / (this.info.frames.length - 1) * this.info.duration;

      if (prevTime < frameTime && newTime >= frameTime) {
        this.markerCallbacks.delete(name);

        callback();
      }
    });
  }

  public markerReached(name: string, callback: () => any): void {
    if (this.info.getMarker(name) === undefined) return;

    this.markerCallbacks.set(name, callback);
  }

  public stop() {
    this._active = false;
  }
}
