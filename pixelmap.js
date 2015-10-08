/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Eric Leong
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

//
// constructor
//
var Pixelmap = function(canvas) {
	var gl = this.initWebGL(canvas);      // Initialize the GL context
	
	// Only continue if WebGL is available and working
	
	if (gl) {
		this.gl = gl;

		this.gl.enable(this.gl.BLEND);
		this.gl.disable(this.gl.DEPTH_TEST);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		// Initialize the shaders; this is where all the lighting for the
		// vertices and so forth is established.
		
		this.initShaders();
		
		// Here's where we call the routine that builds all the objects
		// we'll be drawing.
		
		this.initBuffers();

		// Load and set up the textures we'll be using.

		this.initTextures();
	}
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
Pixelmap.prototype.initWebGL = function(canvas) {
	var gl = null;
	
	try {
		gl = canvas.getContext('experimental-webgl', {
			depth: false,
			preserveDrawingBuffer: true
		});
	} catch(e) {
		gl = null;
	}

	return gl;
}

//
// create gl program
//
Pixelmap.prototype.createProgram = function(gl) {

	var vertexShader = Pixelmap.prototype.getShader(gl, this.getVertexShader(), gl.VERTEX_SHADER);
	var fragmentShader = Pixelmap.prototype.getShader(gl, this.getFragmentShader(), gl.FRAGMENT_SHADER);
	
	// Create the shader programs
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	// If creating the shader program failed, alert
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program.');
	}

	return program;
}

Pixelmap.prototype.getVertexShader = function() {
	return 'attribute vec3 aVertexPosition;\
			attribute vec2 aTextureCoord;\
\
			varying highp vec2 vTextureCoord;\
\
			void main(void) {\
				gl_Position = vec4(aVertexPosition, 1.0);\
\
				vTextureCoord = aTextureCoord;\
			}';
}

Pixelmap.prototype.getFragmentShader = function() {
	return 'precision mediump float;\
\
			varying highp vec2 vTextureCoord;\
\
			uniform sampler2D uImage;\
			uniform sampler2D uMap;\
\
			void main(void) {\
				vec4 position = texture2D(uMap, vTextureCoord);\
				gl_FragColor = texture2D(uImage, vec2(position.x, position.y));\
			}';
}

//
// getShader
//
Pixelmap.prototype.getShader = function(gl, source, type) {
	// Now figure out what type of shader script we have,
	// based on its MIME type.
	
	var shader = gl.createShader(type);
	
	// Send the source to the shader object
	
	gl.shaderSource(shader, source);
	
	// Compile the shader program
	
	gl.compileShader(shader);
	
	// See if it compiled successfully
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}

//
// initShaders
//
Pixelmap.prototype.initShaders = function() {

	// create program
	this.program = this.createProgram(this.gl);
	
	// textures
	this.uImage = this.gl.getUniformLocation(this.program, 'uImage');
	this.uMap = this.gl.getUniformLocation(this.program, 'uMap');

	// vertex attributes
	this.aVertexPosition = this.gl.getAttribLocation(this.program, 'aVertexPosition');
	this.gl.enableVertexAttribArray(this.aVertexPosition);

	this.aTextureCoord = this.gl.getAttribLocation(this.program, 'aTextureCoord');
	this.gl.enableVertexAttribArray(this.aTextureCoord);
}

//
// initBuffers
//
Pixelmap.prototype.initBuffers = function() {

	// Map the texture onto the rect's face.
	this.rectVerticesTextureCoordBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesTextureCoordBuffer);
	
	var textureCoordinates = [
		// Front
		0.0, 1.0,
		1.0, 1.0,
		0.0, 0.0,
		1.0, 0.0
	];

	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);
	
	// Create a buffer for the rect's vertices.
	
	this.rectVerticesBuffer = this.gl.createBuffer();
	
	// Select the this.rectVerticesBuffer as the one to apply vertex
	// operations to from here out.
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesBuffer);
	
	// Now create an array of vertices for the rect. Note that the Z
	// coordinate is always 0 here.
	
	var vertices = [
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0,
		-1.0, 1.0, 0.0,
		1.0, 1.0, 0.0
	];
	
	// Now pass the list of vertices into WebGL to build the shape. We
	// do this by creating a Float32Array from the JavaScript array,
	// then use it to fill the current vertex buffer.
	
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
}

//
// initialize textures
//
Pixelmap.prototype.initTextures = function() {
	this.imageTexture = this.initTexture();
	this.mapTexture = this.initTexture();
}

//
// initialize texture
//
Pixelmap.prototype.initTexture = function() {
	var texture = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
	
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

	this.gl.bindTexture(this.gl.TEXTURE_2D, null);

	return texture;
}

//
// update viewport
//
Pixelmap.prototype.setViewport = function(width, height) {
	this.gl.viewport(0, 0, width, height);
}

//
// clear
//
Pixelmap.prototype.clear = function() {
	this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
}

//
// draw
//
Pixelmap.prototype.draw = function(image, map) {
	
	this.gl.useProgram(this.program);

	// Draw the rect by binding the array buffer to the rect's vertices
	// array, setting attributes, and pushing it to this.GL.
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesBuffer);
	this.gl.vertexAttribPointer(this.aVertexPosition, 3, this.gl.FLOAT, false, 0, 0);

	// Set the texture coordinates attribute for the vertices.
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesTextureCoordBuffer);
	this.gl.vertexAttribPointer(this.aTextureCoord, 2, this.gl.FLOAT, false, 0, 0);

	// Specify the texture to map onto the face.
	this.gl.uniform1i(this.uImage, 0);
	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture);

	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

	// Specify the map texture.
	this.gl.uniform1i(this.uMap, 1);
	
	this.gl.activeTexture(this.gl.TEXTURE1);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.mapTexture);
	
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, map);

	// Draw!
	this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
}