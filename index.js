var cabinet;
var scr;

var drag;

var mouseStartX;
var mouseCurrX;
var mouseDeltaX;

var theta = -100;

var id = new Float32Array(16);
var idWorld = new Float32Array(16);

const camLoc = [15, 8, 0];
var camScale = 1;

const col = [214, 215, 148];

const scrLoc = [-0.5846, 2.7, 0];

function fitCanv() {
	window.canv.width = window.innerWidth;
	window.canv.height = window.innerHeight;
}

document.addEventListener('mousedown', function(e) {
	drag = true;

	mouseStartX = e.clientX;
});

document.addEventListener('mouseup', function() {
	drag = false;

	theta += mouseDeltaX;
});

document.addEventListener('mousemove', function(e) {
	if (drag) {
		mouseCurrX = e.clientX;

		mouseDeltaX = mouseCurrX - mouseStartX;

		mat4.identity(id);
		mat4.rotate(cabinet.model, id, (theta + mouseDeltaX) / 500, [0, 1, 0]);

		let idWorld = new Float32Array(16);
		mat4.identity(idWorld);
		cabinet.accModel(idWorld);
	}
});

document.addEventListener('mousewheel', function(e) {
	camScale += e.deltaY / 300;

	camScale = Math.min(camScale, 2.0);
	camScale = Math.max(camScale, 0.2);
});

window.addEventListener('resize', fitCanv);

document.addEventListener('DOMContentLoaded', function() {
	// Context
	window.canv = document.getElementById('disp');

	fitCanv();

	ctx = window.canv.getContext('webgl2');

	if (!ctx) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		ctx = window.canv.getContext('experimental-webgl');
	}

	if (!ctx) {
		alert('Your browser does not support WebGL');
	}

	ctx.enable(ctx.DEPTH_TEST);

	ctx.enable(ctx.CULL_FACE);
	ctx.cullFace(ctx.BACK);

	scr = new Mesh('scr', 'tex', 'tex');

	ctx.useProgram(scr.prog.id);

	/* Triangle */
	// Data
	var vaoTri = ctx.createVertexArray();
	ctx.bindVertexArray(vaoTri);

	const vtcTri = [
		0.0, 0.5,
		-0.5, -0.5,
		0.5, -0.5
	];

	var vboTri = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, vboTri);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vtcTri), ctx.STATIC_DRAW);

	// Shader
	const shadVtxTriBuff = Util.rd('res/shad/main.vs');

	var shadVtxTri = ctx.createShader(ctx.VERTEX_SHADER);
	ctx.shaderSource(shadVtxTri, shadVtxTriBuff);

	const shadFragTriBuff = Util.rd('res/shad/red.fs');

	var shadFragTri = ctx.createShader(ctx.FRAGMENT_SHADER);
	ctx.shaderSource(shadFragTri, shadFragTriBuff);

	ctx.compileShader(shadVtxTri);
	if (!ctx.getShaderParameter(shadVtxTri, ctx.COMPILE_STATUS)) {
		console.error('Vertex error: ', ctx.getShaderInfoLog(shadVtxTri));
	}

	ctx.compileShader(shadFragTri);
	if (!ctx.getShaderParameter(shadFragTri, ctx.COMPILE_STATUS)) {
		console.error('Fragment error: ', ctx.getShaderInfoLog(shadFragTri));
	}

	var progTri = ctx.createProgram();
	ctx.attachShader(progTri, shadVtxTri);
	ctx.attachShader(progTri, shadFragTri);

	ctx.linkProgram(progTri);
	if (!ctx.getProgramParameter(progTri, ctx.LINK_STATUS)) {
		console.error('Error linking program', ctx.getProgramInfoLog(prog));
	}

	ctx.validateProgram(progTri);
	if (!ctx.getProgramParameter(progTri, ctx.VALIDATE_STATUS)) {
		console.error('Error validating program', ctx.getProgramInfoLog(prog));
	}

	// Attribute
	var attrPosTri = ctx.getAttribLocation(progTri, 'pos');
	ctx.vertexAttribPointer(attrPosTri, 2, ctx.FLOAT, ctx.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	ctx.enableVertexAttribArray(attrPosTri);

	ctx.useProgram(null);
	ctx.bindVertexArray(null);

	/* Framebuffer */
	var vaoFrame = ctx.createVertexArray();
	ctx.bindVertexArray(vaoFrame);

	const vtcFrame = [
		-1.0, -1.0,
		1.0, -1.0,
		-1.0, 1.0,

		-1.0, 1.0,
		1.0, -1.0,
		1.0, 1.0
	];

	var vboFrame = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, vboFrame);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vtcFrame), ctx.STATIC_DRAW);

	const shadVtxBuff = Util.rd('res/shad/tex.vs');

	var shadVtx = ctx.createShader(ctx.VERTEX_SHADER);
	ctx.shaderSource(shadVtx, shadVtxBuff);

	const shadFragBuff = Util.rd('res/shad/tex.fs');

	var shadFrag = ctx.createShader(ctx.FRAGMENT_SHADER);
	ctx.shaderSource(shadFrag, shadFragBuff);

	ctx.compileShader(shadVtx);
	if (!ctx.getShaderParameter(shadVtx, ctx.COMPILE_STATUS)) {
		console.error('Vertex error: ', ctx.getShaderInfoLog(shadVtx));
	}

	ctx.compileShader(shadFrag);
	if (!ctx.getShaderParameter(shadFrag, ctx.COMPILE_STATUS)) {
		console.error('Fragment error: ', ctx.getShaderInfoLog(shadFrag));
	}

	var progFrame = ctx.createProgram();
	ctx.attachShader(progFrame, shadVtx);
	ctx.attachShader(progFrame, shadFrag);

	ctx.linkProgram(progFrame);
	if (!ctx.getProgramParameter(progFrame, ctx.LINK_STATUS)) {
		console.error('Error linking program', ctx.getProgramInfoLog(prog));
	}

	ctx.validateProgram(progFrame);
	if (!ctx.getProgramParameter(progFrame, ctx.VALIDATE_STATUS)) {
		console.error('Error validating program', ctx.getProgramInfoLog(prog));
	}

	// Attribute
	var attrPosFrame = ctx.getAttribLocation(progFrame, 'pos');
	ctx.vertexAttribPointer(attrPosFrame, 2, ctx.FLOAT, ctx.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	ctx.enableVertexAttribArray(attrPosFrame);

	ctx.useProgram(null);
	ctx.bindVertexArray(null);

	var tex = ctx.createTexture();
	ctx.bindTexture(ctx.TEXTURE_2D, tex);

	ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, 256, 256, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);

	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);

	var fbo = ctx.createFramebuffer();
	ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);

	var cbo = ctx.COLOR_ATTACHMENT0;
	ctx.framebufferTexture2D(ctx.FRAMEBUFFER, cbo, ctx.TEXTURE_2D, tex, 0);

	// Render to texture
	ctx.clearColor(0, 0, 0, 1.0);
	ctx.clear(ctx.COLOR_BUFFER_BIT);

	ctx.bindVertexArray(vaoTri);
	ctx.useProgram(progTri);

	ctx.drawArrays(ctx.TRIANGLES, 0, 3);

	ctx.useProgram(null);
	ctx.bindVertexArray(null);

	ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

	cabinet = new Mesh('cabinet', 'obj', 'dir', [0, 0, 0], [0, theta, 0], [
		scr
	]);

	ctx.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);

	function draw() {
		ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

		cabinet.draw();

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
