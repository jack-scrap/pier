var cabinet;
var scr;

var drag;

var mouseStartX;
var mouseCurrX;
var mouseDeltaX;

var theta = 0.3;

var id = new Float32Array(16);
var idWorld = new Float32Array(16);

const camLoc = [15, 8, 0];
var camScale = 1;

var shipSpeed = 0.003;

var modelShip;

var progShip;
var uniModelShip;

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

document.addEventListener('keydown', function(e) {
	switch (e.keyCode) {
		case 37: // Left
			e.preventDefault();

			progShip.use();

			mat4.rotate(modelShip, modelShip, 0.1, [0, 0, 1]);

			ctx.uniformMatrix4fv(uniModelShip, ctx.FALSE, modelShip);

			progShip.unUse();

			break;

		case 39: // Right
			e.preventDefault();

			progShip.use();

			mat4.rotate(modelShip, modelShip, -0.1, [0, 0, 1]);

			ctx.uniformMatrix4fv(uniModelShip, ctx.FALSE, modelShip);

			progShip.unUse();

			break;

		case 38: // Up
			e.preventDefault();

			shipSpeed = 0.01;

			break;
	}
});

document.addEventListener('keyup', function(e) {
	switch (e.keyCode) {
		case 38: // Up
			e.preventDefault();

			shipSpeed = 0.003;

			break;
	}
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

	ctx.lineWidth(5);

	ctx.cullFace(ctx.BACK);

	scr = new Mesh('scr', 'scr', 'tex');

	scr.prog.use();

	/* Ship */
	let vaoShip = ctx.createVertexArray();
	ctx.bindVertexArray(vaoShip);

	const vtcShip = [
		-0.6, -1.0,
		0.6, -1.0,
		0.0, 1.0
	];

	let vboShip = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, vboShip);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vtcShip), ctx.STATIC_DRAW);

	progShip = new Prog('vec', 'green');

	modelShip = new Float32Array(16);
	mat4.identity(modelShip);

	progShip.use();

	// Attributes
	let attrPosShip = ctx.getAttribLocation(progShip.id, 'pos');
	ctx.vertexAttribPointer(attrPosShip, 2, ctx.FLOAT, ctx.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	ctx.enableVertexAttribArray(attrPosShip);

	// Uniforms
	uniModelShip = ctx.getUniformLocation(progShip.id, 'model');
	ctx.uniformMatrix4fv(uniModelShip, ctx.FALSE, modelShip);

	scr.prog.unUse();
	ctx.bindVertexArray(null);

	scr.prog.use();

	let tex = ctx.createTexture();
	ctx.bindTexture(ctx.TEXTURE_2D, tex);

	ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, window.canv.width, window.canv.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);

	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);

	let fbo = ctx.createFramebuffer();
	ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);

	let cbo = ctx.COLOR_ATTACHMENT0;
	ctx.framebufferTexture2D(ctx.FRAMEBUFFER, cbo, ctx.TEXTURE_2D, tex, 0);

	ctx.bindTexture(ctx.TEXTURE_2D, tex);
	ctx.activeTexture(ctx.TEXTURE0);

	scr.prog.unUse();

	cabinet = new Mesh('cabinet', 'obj', 'dir', [0, 0, 0], [0, theta, 0], [
		scr
	]);

	function draw() {
		// Framebuffer
		ctx.disable(ctx.DEPTH_TEST);

		ctx.disable(ctx.CULL_FACE);

		ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);

		ctx.clearColor(0, 0.06, 0, 1.0);
		ctx.clear(ctx.COLOR_BUFFER_BIT);

		ctx.bindVertexArray(vaoShip);
		progShip.use();

		mat4.translate(modelShip, modelShip, [0, shipSpeed, 0]);
		ctx.uniformMatrix4fv(uniModelShip, ctx.FALSE, modelShip);

		ctx.drawArrays(ctx.LINE_LOOP, 0, 3);

		progShip.unUse();
		ctx.bindVertexArray(null);

		ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

		// Cabinet
		ctx.enable(ctx.DEPTH_TEST);

		ctx.enable(ctx.CULL_FACE);

		ctx.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

		cabinet.draw();

		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
});
