import {ShaderProgram} from '../rendering/shaderprogram.js';
import {Matrix4} from '../util/matrix4.js';
import {SpriteSheet} from './spritesheet.js';

export class SpriteModel {
  private currentSprite: number = 0;

  private x: number = 0;
  private y: number = 0;
  private rot: number = 0;

  private activeAnim: SpriteAnimation | null;

  constructor(
    private shader: ShaderProgram,
    private sprite: SpriteSheet
  ) {}

  public setTransformation(x: number, y: number, rot: number): void {
    this.x = x;
    this.y = y;
    this.rot = rot;
  }

  public setCurrentSprite(n: number): void {
    this.currentSprite = n;
  }
  
  public playAnimation(
    name: string,
    duration: number,
    timePassed: number = 0
  ): void {
    const frames = this.sprite.getAnimationFrames(name);

    if (!frames) {
      console.error('Sprite animation frames for "name" do not exist.');

      return;
    }

    this.activeAnim = new SpriteAnimation(this, frames, duration, timePassed);
  }

  public stopAnimation() {
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
      'textureCoord',
      this.sprite.getBuffer(),
      2,
      0,
      this.currentSprite * 2 * 4 * Float32Array.BYTES_PER_ELEMENT,
    );
    this.shader.setUniformMatrix4(
      'modelTransform',
      Matrix4.fromTransformation(this.x, this.y, this.rot),
    );
  }
}

export class SpriteAnimation {
  constructor(
    private model: SpriteModel,
    private frames: number[],
    private duration: number,
    private timePassed: number
  ) {}

  public update(deltaTime: number) {
    this.timePassed = (this.timePassed + deltaTime) % this.duration;

    const percentThrough = this.timePassed / this.duration;
    const frameIndex = Math.floor(this.frames.length * percentThrough);

    this.model.setCurrentSprite(this.frames[frameIndex]);
  }
}
