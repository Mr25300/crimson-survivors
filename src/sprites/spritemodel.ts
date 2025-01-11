import { Game } from "../core/game.js";
import { Color } from "../util/color.js";
import { EventConnection, GameEvent } from "../util/gameevent.js";
import { Matrix3 } from "../util/matrix3.js";
import { Vector2 } from "../util/vector2.js";
import { AnimationInfo, SpriteSheet } from "./spritesheet.js";

/** Represents an instance of a sprite sheet with transformations and active animations. */
export class SpriteModel {
  private position: Vector2 = new Vector2();
  private rotation: number = 0;

  /** The space occupied by the sprite texture for the model. */
  private tileScale: Vector2;

  /** Represents the cell of the sprite sheet the sprite model is displaying. */
  private currentCell: number = 0;
  private animations: Map<string, SpriteAnimation> = new Map();
  private animationListener?: EventConnection;
  private currentModifier?: string;

  private highlightColor: Color = new Color(1, 1, 1);
  private highlightStart: number = -1;

  constructor(private sprite: SpriteSheet, private size: Vector2 = new Vector2(1, 1), tiling: boolean = false) {
    if (tiling) this.tileScale = new Vector2(this.size.x / this.sprite.width, this.size.y / this.sprite.height);
    else this.tileScale = new Vector2(1, 1);

    const objects: Set<SpriteModel> = Game.instance.spriteModels.get(this.sprite) || new Set();
    if (objects.size === 0) Game.instance.spriteModels.set(this.sprite, objects);

    objects.add(this);
  }

  /**
   * Sets the transformation for the sprite model.
   * @param position The transformation translation.
   * @param rotation The transformation rotation.
   */
  public setTransformation(position: Vector2, rotation: number): void {
    this.position = position;
    this.rotation = rotation;
  }

  /**
   * Set the current cell number of the sprite model.
   * @param cellNumber The sprite cell number.
   */
  public setSpriteCell(cellNumber: number): void {
    this.currentCell = cellNumber;
  }

  /**
   * 
   * @param name The animation name.
   * @param timePassed The start time of the animation.
   * @param speed The speed scale of the animation.
   * @returns The created animation.
   */
  public playAnimation(name: string, timePassed?: number, speed?: number): SpriteAnimation {
    const info: AnimationInfo | undefined = this.sprite.getAnimation(name);
    if (!info) throw new Error(`Sprite animation ${name} does not exist.`);

    const animation: SpriteAnimation = new SpriteAnimation(this, info, timePassed, speed);
    this.animations.set(name, animation);

    if (this.animations.size > 0 && !this.animationListener) {
      this.animationListener = Game.instance.onUpdate.connect((deltaTime: number) => {
        this.updateAnimations(deltaTime);
      });
    }

    return animation;
  }

  /**
   * Determines whether or not an animation is already playing.
   * @param name The animation name.
   * @returns A boolean, true if active and false if not.
   */
  public isAnimationPlaying(name: string): boolean {
    return this.animations.get(name) !== undefined;
  }

  /**
   * Stops an existing animation and stops listening to the game update.
   * @param name The animation name.
   */
  public stopAnimation(name: string): void {
    this.animations.delete(name);

    if (this.animations.size === 0 && this.animationListener) {
      this.animationListener.disconnect();
    }
  }

  public get animationModifier(): string | undefined {
    return this.currentModifier;
  }

  public setAnimationModifier(name: string): void {
    this.currentModifier = name;
  }

  /**
   * Updates and handles the animations for the sprite model.
   * @param deltaTime The time passed for the frame.
   */
  private updateAnimations(deltaTime: number): void {
    let highestPriority: number = -Infinity;
    let selectedFrame: number | undefined;

    this.animations.forEach((anim: SpriteAnimation, key: string) => {
      const animFrame: number = anim.updateFrame(deltaTime);

      // Stop the animation if active
      if (!anim.active) {
        this.animations.delete(key);

        return;
      }

      // Set the new highest frame if it has a greater priority
      if (anim.priority >= highestPriority) {
        highestPriority = anim.priority;
        selectedFrame = animFrame;
      }
    });

    if (selectedFrame !== undefined) this.setSpriteCell(selectedFrame);
  }

  /**
   * Creates and sets the sprite model"s highlight effect.
   * @param color The color of the highlight.
   */
  public createHighlightEffect(color: Color) {
    this.highlightColor = color;
    this.highlightStart = Game.instance.elapsedTime;
  }

  /** Binds the sprite model and its relevant transformation uniforms in preparation for drawing. */
  public bind(): void {
    const transformMatrix: Matrix3 = Matrix3.fromTransformation(this.position, this.rotation, this.size);

    Game.instance.canvas.shader.setUniformFloat("spriteCell", this.currentCell);
    Game.instance.canvas.shader.setUniformMatrix("modelTransform", transformMatrix);
    Game.instance.canvas.shader.setUniformVector("tileScale", this.tileScale);

    Game.instance.canvas.shader.setUniformColor("highlightColor", this.highlightColor);
    Game.instance.canvas.shader.setUniformFloat("highlightStart", this.highlightStart);
  }

  /** Destroys the model"s connection and reference. */
  public destroy(): void {
    if (this.animationListener) this.animationListener.disconnect();

    const models = Game.instance.spriteModels.get(this.sprite);
    if (!models) return;

    models.delete(this);

    if (models.size === 0) Game.instance.spriteModels.delete(this.sprite);
  }
}

export class SpriteAnimation {
  /** The event for when an animation marker is passed. */
  public readonly markerReached: GameEvent = new GameEvent();

  private _active = true;

  constructor(
    private model: SpriteModel,
    private info: AnimationInfo,
    private timePassed: number = 0,
    private speed: number = 1
  ) { }

  public get active(): boolean {
    return this._active;
  }

  public get priority(): number {
    return this.info.priority;
  }

  /**
   * Updates the animation and returns its current frame.
   * @param deltaTime The time passed since the last frame.
   * @returns The frame the current animation is on.
   */
  public updateFrame(deltaTime: number): number {
    const prevTime = this.timePassed;
    const newTime = prevTime + deltaTime * this.speed;

    // Loop through markers and fire marker reached events if passed
    this.info.getMarkers().forEach((frame: number, name: string) => {
      const frameTime = frame / this.info.frames.length * this.info.duration;

      if (prevTime < frameTime && newTime >= frameTime) {
        this.markerReached.fire(name);
      }
    });

    // Stop animation if it isn"t looped and has exceeded the duration
    if (newTime >= this.info.duration && !this.info.looped) {
      this.stop();

      return -1;
    }

    this.timePassed = newTime % this.info.duration;

    // Determine the frame based on the time passed through the animation and the active modifiers on the animation
    const percentThrough = this.timePassed / this.info.duration;
    const frameIndex = Math.floor(this.info.frames.length * percentThrough);
    const modifier = this.info.getModifier(this.model.animationModifier!) || 0;

    return this.info.frames[frameIndex] + modifier;
  }
  
  public stop(): void {
    this._active = false;
  }
}