const kiwi = require('./../src/init');

const vText = `attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;

void main() {
   // Add in the translation.
   vec2 position = a_position + u_translation;

   // convert the position from pixels to 0.0 to 1.0
   vec2 zeroToOne = position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}`;

const fText = `precision mediump float;
uniform vec4 u_color;
void main() {
   gl_FragColor = u_color;
}`;

const glCanvas = new kiwi.gl.GLCanvas("mapCanvas");
const gl = glCanvas.getContext('webgl');

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vText);
gl.compileShader(vertexShader);

const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fText);
gl.compileShader(fragShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);


// look up where the vertex data needs to go.
var positionLocation = gl.getAttribLocation(program, "a_position");

// lookup uniforms
var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
var colorLocation = gl.getUniformLocation(program, "u_color");
var translationLocation = gl.getUniformLocation(program, "u_translation");

// Create a buffer to put positions in
var positionBuffer = gl.createBuffer();
// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// Put geometry data into buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // left column
    0, 0,
    30, 0,
    0, 150,
    0, 150,
    30, 0,
    30, 150,
    // top rung
    30, 0,
    100, 0,
    30, 30,
    30, 30,
    100, 0,
    100, 30,
    // middle rung
    30, 60,
    67, 60,
    30, 90,
    30, 90,
    67, 60,
    67, 90,]), gl.STATIC_DRAW);

var translation = [0, 0];
var color = [Math.random(), Math.random(), Math.random(), 1];

drawScene();

//   // Setup a ui.
//   webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
//   webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

//   function updatePosition(index) {
//     return function(event, ui) {
//       translation[index] = ui.value;
//       drawScene();
//     }
//   }

// Draw the scene.
function drawScene() {
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, 800, 600);
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)
    // set the resolution
    gl.uniform2f(resolutionLocation, 800, 600);
    // set the color
    gl.uniform4fv(colorLocation, color);
    // Set the translation.
    gl.uniform2fv(translationLocation, translation);
    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 18;  // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
}