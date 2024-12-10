"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
class Shader {
    constructor(gl, vertSource, fragSource) {
        this.gl = gl;
        this.attribLocations = {};
        this.uniformLocations = {};
        const program = gl.createProgram();
        if (program == null)
            throw new Error("Failed to create program.");
        this.program = program;
        this.vertShader = this.createShader(gl.VERTEX_SHADER, vertSource);
        this.fragShader = this.createShader(gl.FRAGMENT_SHADER, fragSource);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Failed to link shader program: " + gl.getProgramInfoLog(program));
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.error("Failed to validate shader program: " + gl.getProgramInfoLog(program));
        }
    }
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        if (shader == null)
            throw new Error("Failed to create shader.");
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader);
            throw new Error(`Error compiling ${type == this.gl.VERTEX_SHADER ? "vertex" : "fragment"} shader: ` + this.gl.getShaderInfoLog(shader));
        }
        this.gl.attachShader(this.program, shader);
        return shader;
    }
    createAttrib(name) {
        const location = this.gl.getAttribLocation(this.program, name);
        if (location < 0) {
            console.error(`Attribute ${name} not found.`);
            return;
        }
        this.attribLocations[name] = location;
    }
    createUniform(name) {
        const location = this.gl.getUniformLocation(this.program, name);
        if (!location) {
            console.error(`Uniform ${name} not found.`);
            return;
        }
        this.uniformLocations[name] = location;
    }
    setAttribBuffer(name, buffer, size) {
        const location = this.attribLocations[name];
        if (location === undefined)
            throw new Error(`Attrib "${name}" does not exist.`);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(location);
    }
    setUniformMatrix4(name, value) {
        const location = this.uniformLocations[name];
        if (location === undefined)
            throw new Error(`Uniform "${name}" does not exist.`);
        this.gl.uniformMatrix4fv(location, false, value);
    }
    use() {
        this.gl.useProgram(this.program);
    }
    draw(model) {
        this.setAttribBuffer("position", model.vertexBuffer, 3);
        this.setAttribBuffer("color", model.colorBuffer, 3);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        this.gl.drawElements(this.gl.LINES, model.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
    destroy() {
        this.gl.deleteShader(this.vertShader);
        this.gl.deleteShader(this.fragShader);
        this.gl.deleteProgram(this.program);
    }
}
class Model {
    get vertexBuffer() {
        return this._vertexBuffer;
    }
    get colorBuffer() {
        return this._colorBuffer;
    }
    get indexBuffer() {
        return this._indexBuffer;
    }
    get indexCount() {
        return this._indexCount;
    }
    constructor(gl, vertices, colors, indices, dimensions) {
        this.gl = gl;
        this.dimensions = dimensions;
        this._vertexBuffer = this.createBuffer(vertices, false);
        this._colorBuffer = this.createBuffer(colors, false);
        this._indexBuffer = this.createBuffer(indices, true);
        this._indexCount = indices.length;
    }
    createBuffer(data, element) {
        const type = element ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
        const bufferData = element ? new Uint16Array(data) : new Float32Array(data);
        const buffer = this.gl.createBuffer();
        if (buffer == null) {
            throw new Error("Failed to create buffer.");
        }
        this.gl.bindBuffer(type, buffer);
        this.gl.bufferData(type, bufferData, this.gl.STATIC_DRAW);
        return buffer;
    }
    destroy() {
        this.gl.deleteBuffer(this._vertexBuffer);
        this.gl.deleteBuffer(this.colorBuffer);
        this.gl.deleteBuffer(this.indexBuffer);
    }
}
function loadShaderFile(url) {
    return fetch(url).then(response => {
        if (!response.ok)
            throw new Error(`Failed to load shader file: ${url}`);
        return response.text();
    });
}
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}
class Renderer {
    constructor(canvas) {
        const gl = canvas.getContext("webgl2");
        Promise.all([
            loadShaderFile("res/shaders/vertex.glsl"),
            loadShaderFile("res/shaders/fragment.glsl")
        ]).then(([vertSource, fragSource]) => {
            const shader = new Shader(gl, vertSource, fragSource);
            shader.use();
            shader.createAttrib("vertexPos");
            shader.createAttrib("textureCoord");
            shader.createUniform("transform");
            shader.createUniform("camera");
            gl.clearColor(1, 1, 1, 1);
            gl.enable(gl.DEPTH_TEST);
            // drawing
            const image = new Image();
            image.src = "./res/assets/testsprite.png";
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
            image.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                }
                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            };
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const positions = [
                1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                -1.0, -1.0,
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            const textureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
            const textureCoordinates = [
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
        });
    }
}
exports.Renderer = Renderer;
