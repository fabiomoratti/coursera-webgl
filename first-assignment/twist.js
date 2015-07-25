"use strict";

var gl;

var points = [];

var NumTimesToSubdivide = 0;

var rotation = 0;

var twistCoefficient = 2;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert("WebGL is not avaliable");
    }

    document.getElementById('num-subdivisions').onchange = function (event) {
        var slider = document.getElementById('num-subdivisions');
        document.getElementById('num-subdivisions-label').innerHTML = slider.value;
        NumTimesToSubdivide = slider.value;
        computeGeometry();
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        render();
    };

    document.getElementById('rotation').onchange = function (event) {
        var slider = document.getElementById('rotation');
        document.getElementById('rotation-label').innerHTML = slider.value;
        rotation = slider.value;
        computeGeometry();
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        render();
    };

    document.getElementById('twist-coefficient').onchange = function (event) {
        var slider = document.getElementById('twist-coefficient');
        document.getElementById('twist-coefficient-label').innerHTML = slider.value;
        twistCoefficient = slider.value;
        computeGeometry();
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        render();
    };

    computeGeometry();

    // configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    //gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // associate shader variables with JS variables
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

function computeGeometry() {

    console.log("compute geometry");
    points = [];
    // define geometry
    var vertices = [
        vec2(-0.5, -0.9),
        vec2(0.0, 0.9),
        vec2(0.5, -0.9)
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

    //points = rotateVertices();
    points = twistVertices();

}

function triangle(a, b, c) {
    points.push(a, b, b, c, c, a);
}

function divideTriangle(a, b, c, count) {

    // check for end of recursion

    if (count == 0) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // four new triangles

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(ab, ac, bc, count);
    }
}

function rotateVertices() {

    //var theta = 2 * Math.PI / 360 * rotation;
    var theta = Math.PI / 360 * rotation;
    //var theta = Math.PI/4;

    var i, len, x, y, xr, yr;
    var rotatedPoints = [];
    for (i = 0, len = points.length; i < len; i++) {
        x = points[i][0];
        y = points[i][1];
        xr = x * Math.cos(theta) - y * Math.sin(theta);
        yr = x * Math.sin(theta) + y * Math.cos(theta);
        rotatedPoints.push(vec2(xr, yr));
    }

    return rotatedPoints;
}

function twistVertices() {

    //var theta = 2 * Math.PI / 360 * rotation;
    //var theta = Math.PI/4;

    var i, len, theta, d, x, y, xr, yr;
    var rotatedPoints = [];
    for (i = 0, len = points.length; i < len; i++) {
        x = points[i][0];
        y = points[i][1];
        d = Math.sqrt(x * x + y * y);
        theta = (Math.PI / 360) * rotation * d * twistCoefficient;
        xr = x * Math.cos(theta) - y * Math.sin(theta);
        yr = x * Math.sin(theta) + y * Math.cos(theta);
        rotatedPoints.push(vec2(xr, yr));
    }

    return rotatedPoints;
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLES, 0, points.length);
    gl.drawArrays(gl.LINES, 0, points.length);
}
