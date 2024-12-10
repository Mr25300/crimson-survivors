import {ShaderProgram} from "../rendering/shaderprogram.js";
import {Matrix4} from "../util/matrix4.js";
import {Vector2} from "../util/vector2.js";
import {AnimationInfo, SpriteSheet} from "./spritesheet.js";

export class SpriteModel {
  private position: Vector2 = new Vector2();
  private rotation: number = 0;

  private currentSprite: number = 0;
  private animations: SpriteAnimation[] = [];

  constructor(
    private shader: ShaderProgram,
    private sprite: SpriteSheet
  ) {}

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
      console.error(`Sprite animation frames for "name" do not exist.`);

      return null;
    }

    const animation = new SpriteAnimation(this, info, timePassed, speed);

    this.animations.push(animation);

    return animation;
  }

  public stopAnimation(name: string) {
    for (let i = 0; i < this.animations.length; i++) {
      
    }

    if (this.activeAnim) {
      this.activeAnim = null;
    }
  }

  public update(deltaTime: number) {
    if (this.activeAnim) {
      this.activeAnim.update(deltaTime);
    }
  }

  public bind(): void {
    this.shader.setAttribBuffer(
      "textureCoord",
      this.sprite.getBuffer(),
      2,
      0,
      this.currentSprite * 2 * 4 * Float32Array.BYTES_PER_ELEMENT
    );
    this.shader.setUniformMatrix4(
      "modelTransform",
      Matrix4.fromTransformation(this.position, this.rotation).values
    );
  }
}

export class SpriteAnimation {
  constructor(
    private model: SpriteModel,
    private info: AnimationInfo,
    private timePassed: number = 0,
    private speed: number = 1
  ) {}

  public update(deltaTime: number): void {
    this.timePassed = this.timePassed + deltaTime * this.speed;

    if (this.timePassed > this.info.duration) {
      if (!this.info.looped) {
        this.model.stopAnimation();

        return;
      }

      this.timePassed %= this.info.duration;
    }

    const percentThrough = this.timePassed / this.info.duration;
    const frameIndex = Math.floor(this.info.frames.length * percentThrough);

    this.model.setCurrentSprite(this.info.frames[frameIndex]);
  }
}
