import { Shader } from "./renderer";

class Sprite {
    private current = 0;

    private texture: WebGLTexture;

    constructor(
        private shader: Shader,
        private width: number,
        private height: number,
        private columns: number,
        private rows: number,
        private count: number,
        private imagePath: string,
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
            -width / 2, -height / 2,
            width / 2, -height / 2,
            -width / 2, height / 2,
            width / 2, height / 2
        ]);

        const textureCoords = new Float32Array(spriteCoords);

        const texture: WebGLTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        const image = new Image();
        image.src = imagePath;

        image.addEventListener("load", () => {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        });



        // gl.generateMipmap(gl.TEXTURE_2D);
    }

    public createModel() {
        return new Model(this);
    }

    public bind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
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
    ) { }

    public update(delta: number) {
        this.timePassed = (this.timePassed + delta) % (this.frames.length * 1 / this.fps);

        const frame = Math.floor(this.timePassed / (1 / this.fps)) % this.frames.length;
    }
}