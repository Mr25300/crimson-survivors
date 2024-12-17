import {ShaderProgram} from "../rendering/shaderprogram.js";
import {Matrix4} from "../util/matrix4.js";
import {Vector2} from "../util/vector2.js";
import {AnimationInfo, SpriteSheet} from "./spritesheet.js";

export class SpriteModel {
  public static activeModels: Map<SpriteSheet, SpriteModel[]>;

  private position: Vector2 = new Vector2();
  private rotation: number = 0;

  private currentSprite: number = 0;
  private animations: Map<string, SpriteAnimation> = new Map();

  constructor(
    private shader: ShaderProgram,
    private sprite: SpriteSheet
  ) {
    let models = SpriteModel.activeModels.get(sprite);

    if (!models) {
      models = [];

      SpriteModel.activeModels.set(sprite, models);
    }

    models.push(this);
  }

  public setTransformation(position: Vector2, rotation: number): void {
    this.position = position;
    this.rotation = rotation;
  }

  public setCurrentSprite(n: number): void {
    this.currentSprite = n;
  }

  public playAnimation(name: string, timePassed?: number, speed?: number): SpriteAnimation | null {
    const info = this.sprite.getAnimation(name);

    if (!info) {
      console.error(`Sprite animation "name" does not exist.`);

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

  public bind(): void {
    this.shader.setAttribBuffer("textureCoord", this.sprite.buffer, 2, 0, this.currentSprite * 2 * 4 * Float32Array.BYTES_PER_ELEMENT);
    this.shader.setUniformMatrix4("modelTransform", Matrix4.fromTransformation(this.position, this.rotation).values);
  }

  public destroy(): void {
    const models = SpriteModel.activeModels.get(this.sprite)!;

    models.splice(models.indexOf(this));

    if (models.length === 0) {
      SpriteModel.activeModels.delete(this.sprite);
    }
  }
}

export class SpriteAnimation {
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
    this.timePassed = this.timePassed + deltaTime * this.speed;

    if (this.timePassed > this.info.duration) {
      if (!this.info.looped) this.stop();

      this.timePassed %= this.info.duration;
    }

    const percentThrough = this.timePassed / this.info.duration;
    const frameIndex = Math.floor(this.info.frames.length * percentThrough);

    this.model.setCurrentSprite(this.info.frames[frameIndex]);
  }

  public stop() {
    this._active = false;
  }
}
