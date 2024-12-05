import { ShaderProgram } from '../rendering/shaderprogram';
import { SpriteSheet } from './spritesheet.js';

export class SpriteModel {
  private currentSprite: number;

  constructor(
    private shader: ShaderProgram,
    private sprite: SpriteSheet
  ) {}

  public setCurrentSprite(n: number) {
    this.currentSprite = n;
  }

  public bind(): void {
    this.shader.setUniformMatrix4('modelTransform', new Float32Array([]));
    this.shader.setAttribBuffer(
      'textureCoord',
      this.sprite.buffer,
      2,
      0,
      this.currentSprite * 2 * 4 * Float32Array.BYTES_PER_ELEMENT,
    );
  }
}
