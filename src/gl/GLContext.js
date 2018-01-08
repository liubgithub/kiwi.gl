/**
 * @author yellow
 */
const Dispose = require('./../utils/Dispose'),
    Record = require('./../core/Record'),
    Recorder = require('./../core/Recorder'),
    GLConstants = require('./GLConstants');
/**
 * bridge object
 */
const GLLimits = require('./GLLimits'),
    GLExtension = require('./GLExtension'),
    GLShader = require('./GLShader'),
    GLBuffer = require('./GLBuffer'),
    GLProgram = require('./GLProgram');
/**
 * singleton
 */
const actuator = require('./../core/Actuator');
/**
 * @class
 */
class GLContext extends Dispose {
    /**
     * 
     * @param {String} id parentId,just as the glCanvas'id
     * @param {String} renderType support 'webgl' or 'webgl2'
     * @param {Object} options 
     */
    constructor(id, renderType, options = {}) {
        super(id);
        /**
         * @type {String}
         */
        this._renderType = renderType;
        /**
         * @type {Object}
         */
        this._options = this._getContextAttributes(options);
        /**
         * @type {Recorder}
         */
        this._recorder = new Recorder(this);
        /**
         * @type {GLLimits}
         */
        this._glLimits = new GLLimits(this);
        /**
         * @type {GLExtension}
         */
        this._glExtension = new GLExtension(this);
        /**
         * real WebGLRenderingContext
         * @type {WebGLRenderingContext}
         */
        this._gl = null;
        /**
         * map funciont
         */
        this._map();
    }
    /**
     * map function and constants to Class
     */
    _map() {
        //1.map constants
        for (const key in GLConstants) {
            if (!this.hasOwnProperty(key)) {
                const target = GLConstants[key];
                if (!this[key] && !!target)
                    this[key] = target;
            }
        }
        //2.map void function
    }
    /**
     * get context attributes
     * include webgl2 attributes
     * reference https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
     * @param {Object} [options] 
     */
    _getContextAttributes(options = {}) {
        return {
            alpha: options.alpha || false,
            depth: options.depth || true,
            stencil: options.stencil || true,
            antialias: options.antialias || false,
            premultipliedAlpha: options.premultipliedAlpha || true,
            preserveDrawingBuffer: options.preserveDrawingBuffer || false,
            failIfMajorPerformanceCaveat: options.failIfMajorPerformanceCaveat || false,
        }
    }
    /*
     * private ,only used in GLCanvas.link[Cnavas/GL] funcitons
     * @param {WebGLRenderingContext} gl 
     */
    _setgl(gl){
        this._gl = gl;
        this._glLimits._include();
        this._glExtension._include();
        //替换绘制实体
        actuator.setGl(gl);
    }
    /**
     * 
     * @returns {WebGLRenderingContext}
     */
    get gl(){
        return this._gl;
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createShader
     * @param {String} type Either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER 
     */
    createShader(type) {
        const glShader = new GLShader(type, this),
            record = new Record('createShader', type);
        //createShader 操作必需返回值
        record.returnId = glShader.id;
        this._recorder.increase(record);
        return glShader;
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/shaderSource
     * @param {GLShader} shader 
     * @param {String} source 
     */
    shaderSource(shader, source) {
        shader.source = source;
        const returnId = shader.id,
            record = new Record('shaderSource', shader, source);
        record.exactIndex(0, returnId);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/compileShader
     * @param {GLShader} shader 
     */
    compileShader(shader) {
        const returnId = shader.id,
            record = new Record('compileShader', shader);
        record.exactIndex(0, returnId);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram
     * 创建program对象
     */
    createProgram() {
        const glProgram = new GLProgram(this),
            record = new Record('createProgram');
        record.returnId = glProgram.id;
        this._recorder.increase(record);
        return glProgram;
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram
     */
    createBuffer() {
        const glBuffer = new GLBuffer(),
            record = new Record('createBuffer');
        record.returnId = glBuffer.id;
        this._recorder.increase(record);
        return glBuffer;
    }
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/attachShader
     * @param {GLProgram} program 
     * @param {GLShader} shader 
     */
    attachShader(program, shader) {
        const record = new Record('attachShader', program.id, shader.id);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/linkProgram
     * @param {GLProgram} program 
     */
    linkProgram(program) {
        const record = new Record('linkProgram', program.id);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation
     * @param {GLProgram} program 
     * @param {String} name 
     */
    getAttribLocation(program, name) {
        const returnId = program.getAttribLocation(name),
            record = new Record('getAttribLocation', program.id, name);
        record.returnId = returnId;
        this._recorder.increase(record);
        return program.getAttribLocation(name);
    }
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/bindBuffer
     * @param {GLenum} target  gl.ARRAY_BUFFER | gl.ELEMENT_ARRAY_BUFFER |等
     * @param {GLBuffer} buffer 
     */
    bindBuffer(target, buffer) {
        const record = new Record('getAttribLocation', target, buffer.id);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    bufferData(target, srcData, usage) {
        const record = new Record('bufferData', target, srcData, usage);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     */
    viewport(x, y, width, height) {
        const record = new Record('viewport', x, y, width, height);
        this._recorder.increase(record);
    }
    /**
     * 
     * @param {GLProgram} program 
     */
    useProgram(program) {
        const record = new Record('useProgram', program.id);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
     * @param {GLuint} index 
     */
    enableVertexAttribArray(index) {
        const record = new Record('enableVertexAttribArray', index);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
     */
    vertexAttribPointer(index, size, type, normalized, stride, offset) {
        const record = new Record('enableVertexAttribArray', index, size, type, normalized, stride, offset);
        this._recorder.increase(record);
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getExtension
     * @param {*} name 
     */
    getExtension(name) {
        const glExtension = this._glExtension;
        return glExtension[name];
    }

    getParameter(pname) {
        const glLimits = this._glLimits;
        return glLimits[pname];
    }
    /**
     * 特别的方法
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
     * @param {*} mode 
     * @param {*} first 
     * @param {*} count 
     */
    drawArrays(mode, first, count) {
        const record = new Record('drawArrays', mode, first, count);
        this._recorder.increase(record);
        actuator.play(this._recorder.toInstruction());
    }
    /**
     * 特别的方法
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
     * @param {*} mode 
     * @param {*} count 
     * @param {*} type 
     * @param {*} offset 
     */
    drawElements(mode, count, type, offset) {
        const record = new Record('drawElements', mode, count, type, offset);
        this._recorder.increase(record);
        actuator.play(this._recorder.toInstruction());
    }

}

module.exports = GLContext;