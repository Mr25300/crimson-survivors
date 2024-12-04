class Sprite {
    private currentGrid = 0;

    constructor(
        private columns: number,
        private rows: number,
        private image: HTMLImageElement,
    ) {

    }
}

class SpriteAnimation {
    private timePassed = 0;
    private fps = 12;

    constructor(
        private frames: number[]
    ) {
        
    }

    public update(delta: number) {
        this.timePassed += delta;

        const frame = Math.floor(this.timePassed / (1 / this.fps)) % this.frames.length;
    }
}

class Model {
    constructor(
        private x: number,
        private y: number,
        private rot: number,
        private image: HTMLImageElement,
    ) {

    }
}