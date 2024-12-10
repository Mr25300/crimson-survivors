"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const CANVAS = document.getElementById("gameScreen");
class Game {
    constructor() {
        new renderer_1.Renderer(CANVAS);
    }
    get instance() {
        if (!Game._instance)
            Game._instance = new Game();
        return Game._instance;
    }
}
