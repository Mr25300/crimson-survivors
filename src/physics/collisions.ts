import { Game } from "../core/game.js";
import { EventConnection } from "../util/gameevent.js";
import { Matrix3 } from "../util/matrix3.js";
import { Timer } from "../util/timer.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";

/** Represents and handles collisions for a non-concave shape. */
export class CollisionObject {
  private CIRCLE_RES: number = 30;

  private _transformedVertices: Vector2[] = [];
  private _normals: Vector2[] = [];
  private _bounds: Bounds;
  private _center: Vector2;
  protected verticesOutdated: boolean = true;
  protected normalsOutdated: boolean = true;
  protected boundsOutdated: boolean = true;
  protected centerOutdated: boolean = true;
  
  private _showing: boolean = false;
  private _vertexCount: number;
  private vertexBuffer?: WebGLBuffer;
  private hideConnection?: EventConnection;

  /**
   * Creates a collision object with the specified.
   * @param vertices The vertices of the shape (going in clockwise order).
   * @param radius The radius of each vertex.
   * @param _position The initial translation transformation.
   * @param _rotation The initial rotation transformation.
   * @param infiniteBarrier Whether or not the shape should be treated as an unpassable barrier (applies to lines only).
   */
  constructor(
    protected vertices: Vector2[],
    private radius: number = 0,
    private _position: Vector2 = new Vector2(),
    private _rotation: number = 0,
    private infiniteBarrier: boolean = false
  ) { }

  public get position(): Vector2 {
    return this._position;
  }

  public get rotation(): number {
    return this._rotation;
  }

  /**
   * Sets the transformations of the collision object.
   * @param position The translation transformation of the vertices.
   * @param rotation The rotation transformation of the vertices.
   */
  public setTransformation(position: Vector2, rotation: number): void {
    this._position = position;
    this._rotation = rotation;

    // Set outdated booleans to true so that transformations are recalculated
    this.verticesOutdated = true;
    this.normalsOutdated = true;
    this.boundsOutdated = true;
    this.centerOutdated = true;
  }

  /**
   * Applies the object's transformations to its vertices.
   * @returns The transformed vertices.
   */
  private getTransformedVertices(): Vector2[] {
    // Handle math only if vertices are outdated and the transformation has changed
    if (this.verticesOutdated) {
      for (let i = 0; i < this.vertices.length; i++) {
        this._transformedVertices[i] = this.vertices[i].rotate(this._rotation).add(this._position);
      }

      this.verticesOutdated = false;
    }

    return this._transformedVertices;
  }

  /**
   * Gets the standard normals of the transformed collision object.
   * @returns The object's normals.
   */
  private getNormals(): Vector2[] {
    // Calculate normals if transformations have occured
    if (this.normalsOutdated) {
      if (this.vertices.length > 1) { // Does not have normals if only one vertex
        const vertices: Vector2[] = this.getTransformedVertices();

        for (let i = 0; i < vertices.length; i++) {
          if (vertices.length === 2 && i === 1) break;

          const vertex1: Vector2 = vertices[i]; // Get the vertex
          const vertex2: Vector2 = vertices[(i + 1) % vertices.length]; // Get the next vertex
          const edge: Vector2 = vertex2.subtract(vertex1); // Get the direction between them
          const normal: Vector2 = edge.perp().unit(); // Get the perpendicular vector for the normal

          this._normals[i] = normal;
        }
      }

      this.normalsOutdated = false;
    }

    return this._normals;
  }

  /**
   * Gets the normals to check for collision with another shape.
   * @param reference The object being collision checked with.
   * @returns The normals to be checked by the collision algorithm.
   */
  private getCollisionNormals(reference: CollisionObject): Vector2[] {
    const radialNormals: Vector2[] = [];

    // Get direction from each vertex to the reference's nearest vertices as a normal for circles
    if (this.radius > 0) {
      for (const vertex of this.getTransformedVertices()) {
        const closestRefVertex = reference.getClosestVertex(vertex);
        const directionAxis = vertex.subtract(closestRefVertex).unit();

        radialNormals.push(directionAxis);
      }
    }

    return [...this.getNormals(), ...radialNormals];
  }

  /**
   * Projects the shape's vertices onto the specified axis and returns the min and max range it occupies.
   * @param axis The axis to project onto.
   * @returns A tuple made up of the minimum and maximum position of the shape on that axis.
   */
  private getProjectedRange(axis: Vector2): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const vertex of this.getTransformedVertices()) {
      const dot = vertex.dot(axis); // Project the vertex onto the axis
      const dotMin = dot - this.radius; // Add the radius
      const dotMax = dot + this.radius; // Subtract the radius

      if (dotMin < min) min = dotMin;
      if (dotMax > max) max = dotMax;
    }

    // Handle ranges for continuous infinite barriers
    if (this.infiniteBarrier) {
      const normal = this.getNormals()[0];

      if (normal.dot(axis) > 0) min = -Infinity; // Make the range infinite to the left if the barrier is semi-parallel to the axis
      else max = Infinity; // Make the range infinite to the right if the barrier is semi-anti-parallel of the axis
    }

    return [min, max];
  }

  /**
   * Gets the bounding box of the shape.
   * @returns The bounds of the shape.
   */
  public getBounds(): Bounds {
    if (this.boundsOutdated) {
      const [minX, maxX] = this.getProjectedRange(new Vector2(1, 0)); // Project the range onto the x axis
      const [minY, maxY] = this.getProjectedRange(new Vector2(0, 1)); // Project the range onto the y axis

      // Create the bounds from the projected ranges
      this._bounds = new Bounds(new Vector2(minX, minY), new Vector2(maxX, maxY));
      this.boundsOutdated = false;
    }

    return this._bounds;
  }

  /**
   * Calculates the average center of the shape.
   * @returns The average of the shape's transformed vertices.
   */
  private getCenter(): Vector2 {
    // Recalculate the center if vertices are outdated
    if (this.centerOutdated) {
      const vertices = this.getTransformedVertices();
      let sum: Vector2 = new Vector2();

      for (const vertex of vertices) {
        sum = sum.add(vertex);
      }

      this._center = sum.divide(vertices.length);
      this.centerOutdated = false;
    }

    return this._center;
  }

  /**
   * Finds the closest vertex of the shape to a reference point.
   * @param point The reference point.
   * @returns The position of the closest vertex.
   */
  public getClosestVertex(point: Vector2): Vector2 {
    let minDistance: number = Infinity;
    let closestVertex: Vector2 = new Vector2();

    for (const vertex of this.getTransformedVertices()) {
      const distance: number = vertex.distance(point);

      if (distance < minDistance) {
        minDistance = distance;
        closestVertex = vertex;
      }
    }

    return closestVertex;
  }

  /**
   * 
   * @param object 
   * @returns A tuple containing:
   * - [0] Whether or not this object intersects the other object.
   * - [1] The collision correction normal for this object.
   * - [2] The overlap of this object relative to the normal.
   */
  public intersects(object: CollisionObject): [boolean, Vector2, number] {
    const normals1: Vector2[] = object.infiniteBarrier ? [] : this.getCollisionNormals(object);
    const normals2: Vector2[] = object.getCollisionNormals(this);
    const existingAxes: Vector2[] = [];

    let minOverlap: number = Infinity;
    let minNormal: Vector2 = new Vector2();

    // Project the shapes onto every unique axis and compare their ranges
    for (const axis of [...normals2, ...normals1]) {
      // Check for any existing axes that are parallel or anti-parallel to the axis
      const alreadyExists = existingAxes.some((existingAxis: Vector2) => {
        const dot = axis.dot(existingAxis);
        if (dot > 0.999 || dot < -0.999) return true;

        return false;
      });

      if (alreadyExists) continue; // Skip the axis as it is parallel/anti-parallel to an existing axis

      existingAxes.push(axis);

      const [min1, max1] = this.getProjectedRange(axis); // Project this shape
      const [min2, max2] = object.getProjectedRange(axis); // Project other shape

      if (min2 > max1 || min1 > max2) return [false, new Vector2(), 0]; // Return false if the ranges do not intersect

      const axisOverlap = Math.min(max2 - min1, max1 - min2); // Calculate the overlap of the ranges

      // Ensure the selected overlap is the lowest possible overlap
      if (axisOverlap < minOverlap) {
        minOverlap = axisOverlap;
        minNormal = axis;
      }
    }

    // Ensure the normal between two shapes is in the right direction as long as it is not a barrier
    if (!object.infiniteBarrier) {
      const direction = this.getCenter().subtract(object.getCenter());
      if (direction.dot(minNormal) < 0) minNormal = minNormal.multiply(-1);
    }

    return [true, minNormal, minOverlap];
  }

  /**
   * Split the shape into two sets of vertices at its widest points.
   * @param length The length of the sweep.
   * @returns The swept collision object of this collision object.
   */
  public sweep(length?: number): SweptCollisionObject {
    let minWidth: number = Infinity;
    let maxWidth: number = -Infinity;
    let minIndex: number = 0;
    let maxIndex: number = 0;

    const startVertices: Vector2[] = [];
    const endVertices: Vector2[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const width = vertex.dot(new Vector2(1, 0)); // Project onto x axis

      if (width < minWidth) { // Set the minimum width if the x position is lesser
        minWidth = width;
        minIndex = i;
      }

      if (width > maxWidth) { // Set the maximum width if the x position is greater
        maxWidth = width;
        maxIndex = i;
      }
    }

    let startIndex: number = maxIndex;
    let endIndex: number = minIndex;

    // Circularly loop between the maximum x index and minimum x index and add them to the start vertices
    while (true) {
      startVertices.push(this.vertices[startIndex]);

      if (startIndex === minIndex) break;
      startIndex = (startIndex + 1) % this.vertices.length;
    }

    // Circularly loop between the minimum x index and maximum x index and add them to the end vertices
    while (true) {
      endVertices.push(this.vertices[endIndex]);

      if (endIndex === maxIndex) break;
      endIndex = (endIndex + 1) % this.vertices.length;
    }

    return new SweptCollisionObject(startVertices, endVertices, this.radius, length, this.position, this.rotation);
  }

  /**
   * Calculates the vertices to use for rendering the collision object
   * @param circleResolution The vertex count resolution for a full circle.
   * @returns The array of rendering 
   */
  private getRenderingVertices(): Vector2[] {
    const renderingVertices: Vector2[] = [];

    for (let i: number = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];

      if (this.radius === 0) {
        renderingVertices.push(vertex);

        continue;
      }

      let startAngle: number = 0;
      let endAngle: number = 2 * Math.PI;

      if (this.vertices.length > 1) {
        const nextVertex: Vector2 = this.vertices[(i + 1) % this.vertices.length]; // Get the next vertex
        const prevIndex: number = i == 0 ? this.vertices.length - 1 : i - 1;
        const prevVertex: Vector2 = this.vertices[prevIndex]; // Circularly get the previous vertex

        startAngle = vertex.subtract(prevVertex).angle() - Math.PI / 2; // Get the angle of the previous edge
        endAngle = nextVertex.subtract(vertex).angle() - Math.PI / 2; // Get the angle of the next edge

        if (endAngle < startAngle) endAngle += 2 * Math.PI; // Ensure the end angle is always greater than the start angle (clockwise)
      }

      // Scale resolution loops based on angle difference
      const resolutionLoops: number = Math.ceil(this.CIRCLE_RES * (endAngle - startAngle) / (Math.PI * 2));

      for (let j = 0; j < resolutionLoops; j++) {
        // Skip the last vertex for a circle so that it does not duplicate vertices
        if (this.vertices.length === 1 && j === resolutionLoops - 1) continue;

        // Lerp between start and end angle so that it ends right at the end angle
        const angle: number = Util.lerp(startAngle, endAngle, j / (resolutionLoops - 1));
        const offset: Vector2 = Vector2.fromAngle(angle).multiply(this.radius);

        renderingVertices.push(vertex.add(offset));
      }
    }

    return renderingVertices;
  }

  /** Create the vertex buffer based on the model's rendering vertices. */
  protected createVertexBuffer(): void {
    this.deleteExistingBuffer();

    const vertices: Vector2[] = this.getRenderingVertices();
    const vertexArray: Float32Array = new Float32Array(vertices.length * 2);

    for (let i = 0; i < vertices.length; i++) {
      const vertex: Vector2 = vertices[i];

      vertexArray[i * 2] = vertex.x;
      vertexArray[i * 2 + 1] = vertex.y;
    }

    this.vertexBuffer = Game.instance.canvas.createBuffer(vertexArray);
    this._vertexCount = vertices.length;
  }

  /** Clear the existing vertex buffer. */
  private deleteExistingBuffer(): void {
    if (!this.vertexBuffer) return;

    Game.instance.canvas.deleteBuffer(this.vertexBuffer);
    delete this.vertexBuffer;
  }

  /**
   * Display the collision object.
   * @param duration The show duration.
   */
  public show(duration?: number): void {
    this._showing = true;

    if (!this.vertexBuffer) this.createVertexBuffer();

    Game.instance.collisionObjects.add(this); // Add to game reference

    if (duration !== undefined) {
      this.hideConnection = Timer.delay(duration, () => {
        this.hide();
      });
    }
  }

  public get showing(): boolean {
    return this._showing;
  }

  public get vertexCount(): number {
    return this._vertexCount;
  }

  /** Bind existing vertex buffer and transform uniform. */
  public bind(): void {
    if (!this.vertexBuffer) return;

    Game.instance.canvas.shader.setAttribBuffer("vertexPos", this.vertexBuffer, 2, 0, 0);
    Game.instance.canvas.shader.setUniformMatrix("modelTransform", Matrix3.fromTransformation(this.position, this.rotation));
  }

  /** Hide the object and delete the buffer. */
  public hide(): void {
    if (!this._showing) return;
    this._showing = false;

    Game.instance.collisionObjects.delete(this); // Remove from game reference

    if (this.hideConnection) this.hideConnection.disconnect();
    this.deleteExistingBuffer();
  }
}

/** Represents a collision object with variable length sweeping. */
export class SweptCollisionObject extends CollisionObject {
  constructor(
    private startVertices: Vector2[],
    endVertices: Vector2[],
    radius?: number,
    length: number = 0,
    position?: Vector2,
    rotation?: number
  ) {
    super([], radius, position, rotation);

    for (let i = 0; i < endVertices.length; i++) {
      this.vertices[startVertices.length + i] = endVertices[i];
    }

    this.sweepVertices(length);
  }

  /**
   * Sweep starting vertices back the specified length.
   * @param length The length to sweep back.
   */
  public sweepVertices(length: number): void {
    // Subtract length to start vertices
    for (let i = 0; i < this.startVertices.length; i++) {
      this.vertices[i] = this.startVertices[i].subtract(new Vector2(0, length));
    }

    // Fix outdated vertex buffer and vertices, normals, bounds and center
    if (this.showing) this.createVertexBuffer();

    this.verticesOutdated = true;
    this.normalsOutdated = true;
    this.boundsOutdated = true;
    this.centerOutdated = true;
  }
}

export class Polygon extends CollisionObject {
  constructor(
    vertices: Vector2[],
    position?: Vector2,
    rotation?: number
  ) {
    super(vertices, 0, position, rotation);
  }
}

export class Rectangle extends CollisionObject {
  constructor(
    width: number,
    height: number,
    offset: Vector2 = new Vector2(),
    position?: Vector2,
    rotation?: number
  ) {
    super([
      new Vector2(-width / 2, -height / 2).add(offset),
      new Vector2(-width / 2, height / 2).add(offset),
      new Vector2(width / 2, height / 2).add(offset),
      new Vector2(width / 2, -height / 2).add(offset)

    ], 0, position, rotation);
  }
}

export class Circle extends CollisionObject {
  constructor(
    radius: number,
    offset: Vector2 = new Vector2(),
    position?: Vector2,
    rotation?: number
  ) {
    super([offset], radius, position, rotation);
  }
}

export class Line extends CollisionObject {
  constructor(start: Vector2, end: Vector2) {
    const center: Vector2 = start.add(end).divide(2);
    const direction: Vector2 = end.subtract(start);
    const length: number = direction.magnitude();

    super([
      new Vector2(0, -length / 2),
      new Vector2(0, length / 2)

    ], 0, center, direction.angle());
  }
}

export class Point extends CollisionObject {
  constructor(position: Vector2) {
    super([new Vector2()], 0, position, 0);
  }
}

export class Barrier extends CollisionObject {
  constructor(position: Vector2, rotation: number) {
    super([new Vector2(-0.5), new Vector2(0.5)], 0, position, rotation, true);
  }
}

/** Represents a rectangular bound in space. */
export class Bounds {
  constructor(
    private _min: Vector2,
    private _max: Vector2
  ) {}

  public get min(): Vector2 {
    return this._min;
  }

  public get max(): Vector2 {
    return this._max;
  }

  /**
   * Calculates the average center of the bound.
   * @returns The center vector.
   */
  public getCenter(): Vector2 {
    return this._min.add(this._max).divide(2);
  }

  /**
   * Calculates the width and height dimensions of the bound.
   * @returns The vector dimensions.
   */
  public getDimensions(): Vector2 {
    return this._max.subtract(this._min);
  }

  /**
   * Determines whether or not this bound overlaps with another.
   * @param bounds The comparison bound.
   * @returns Whether or not it overlaps the bound.
   */
  public overlaps(bounds: Bounds): boolean {
    const xOverlap: boolean = this._max.x > bounds._min.x && this._min.x < bounds._max.x;
    const yOverlap: boolean = this._max.y > bounds._min.y && this._min.y < bounds._max.y;

    return xOverlap && yOverlap;
  }

  /**
   * Calculates how far outside an inner bound is of the bound.
   * @param innerRect The bound to be contained inside this bound.
   * @returns The inner bound's overlap going out.
   */
  public getInnerOverlap(innerRect: Bounds): Vector2 {
    let overlap: Vector2 = new Vector2();

    const minDiff: Vector2 = innerRect._min.subtract(this._min);
    const maxDiff: Vector2 = innerRect._max.subtract(this._max);

    if (minDiff.x < 0) overlap = overlap.add(new Vector2(minDiff.x, 0));
    if (maxDiff.x > 0) overlap = overlap.add(new Vector2(maxDiff.x, 0));
    if (minDiff.y < 0) overlap = overlap.add(new Vector2(0, minDiff.y));
    if (maxDiff.y > 0) overlap = overlap.add(new Vector2(0, maxDiff.y));

    return overlap;
  }
}