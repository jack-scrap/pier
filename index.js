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
	camScale += e.deltaY / 100;

	camScale = Math.min(camScale, 2.0);
	camScale = Math.max(camScale, 0.2);
});

window.addEventListener('resize', fitCanv);

document.addEventListener('DOMContentLoaded', function() {
	// Context
	window.canv = document.getElementById('disp');

	fitCanv();

	window.ctx = window.canv.getContext('webgl2');

	if (!window.ctx) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		window.ctx = window.canv.getContext('experimental-webgl');
	}

	if (!window.ctx) {
		alert('Your browser does not support WebGL');
	}

	window.ctx.enable(window.ctx.DEPTH_TEST);

	window.ctx.enable(window.ctx.CULL_FACE);
	ctx.cullFace(ctx.BACK);

	scr = new Mesh('scr', 'tex', 'tex', scrLoc);

	ctx.useProgram(scr.prog.id);

	var tex = ctx.createTexture();
	ctx.bindTexture(ctx.TEXTURE_2D, tex);

	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);

	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);

	ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, document.getElementById('texImg'));

	ctx.bindTexture(ctx.TEXTURE_2D, null);

	ctx.useProgram(scr.prog.id);

	ctx.bindTexture(ctx.TEXTURE_2D, tex);
	ctx.activeTexture(ctx.TEXTURE0);

	ctx.useProgram(null);

	cabinet = new Mesh('cabinet', 'obj', 'dir', [0, 0, 0], [0, theta, 0], [
		scr
	]);

	function draw() {
		window.ctx.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		window.ctx.clear(window.ctx.COLOR_BUFFER_BIT | window.ctx.DEPTH_BUFFER_BIT);

		cabinet.draw();

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
