"use strict";

var gl;

var canvas;

var mode = 'moving';

var maxNumVertices = 5000;

var index = 0;
var numCurves = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var drawingLine = [];

var bufferId;
var bufferId_1;


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert("WebGL is not avaliable");
    }

    canvas.addEventListener("mousedown", function (event) {

        console.log("Mouse down event!");
        mode = 'drawing';
        

    });

    canvas.addEventListener("mouseup", function (event) {

        console.log("Mouse up event!");
        mode = 'moving';

        numCurves++;
        numIndices[numCurves] = 0;
        start[numCurves] = index;

        render();

    });

    canvas.addEventListener("mousemove", function (event) {
        console.log("Mouse move event! - X: ");
        var p;
        if (mode == 'drawing') {
            p = transformation(event.layerX, event.layerY);
            drawingLine.push(p);

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_1);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(drawingLine), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(p));

            numIndices[numCurves]++;
            index++;

            render();

        }

    });

    // configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    //gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

    bufferId_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_1);

    // associate shader variables with JS variables
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

function transformation(xw, yw) {

    var x = -1 + (2 * xw) / canvas.width;
    var y = -1 + 2 * (canvas.height - yw) / canvas.height;
    return vec2(x, y);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (mode == 'drawing') {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_1);
        gl.drawArrays(gl.LINE_STRIP, 0, drawingLine.length);
    }

    for (var i = 0; i < numCurves; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        //gl.drawArrays(gl.LINES, start[i], numIndices[i]);
        gl.drawArrays(gl.LINE_STRIP, start[i], numIndices[i]);
    }
}
