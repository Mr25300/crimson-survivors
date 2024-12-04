class Texture {

}

class Sprite {
    private current = 0;

    constructor(
        private gl: WebGL2RenderingContext,
        private width: number,
        private height: number,
        private columns: number,
        private rows: number,
        private count: number,
        private image: HTMLImageElement,
    ) {
        const spriteCoords: number[] = [];

        for (let i: number = 0; i < count; i++) {
            const currentRow = Math.floor(i / columns);
            const startX = (i % columns) / columns;
            const endX = (i % columns) / columns;
            const startY = currentRow / rows;
            const endY = (currentRow + 1) / rows;

            spriteCoords.push(
                startX, endY,
                endX, endY,
                startX, startY,
                endX, startY
            );
        }

        const vertices = new Float32Array([
            -width/2, -height/2,
            width/2, -height/2,
            -width/2, height/2,
            width/2, height/2
        ]);

        const textureCoords = new Float32Array(spriteCoords);


    }

    public createModel() {
        return new Model(this);
    }

    public bind() {

    }
}

class Model {
    private x: number = 0;
    private y: number = 0;
    private rot: number = 0;

    constructor(
        private sprite: Sprite
    ) {

    }

    public bind() {
        
    }
}

class SpriteAnimation {
    private timePassed = 0;
    private fps = 12;

    constructor(
        private sprite: Sprite,
        private frames: number[]
    ) {}

    public update(delta: number) {
        this.timePassed = (this.timePassed + delta) % (this.frames.length * 1 / this.fps);

        const frame = Math.floor(this.timePassed / (1 / this.fps)) % this.frames.length;
    }
}