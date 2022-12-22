var
	cabinet,
	scr,

	drag,

	mouseStartX,
	mouseCurrX,
	mouseDeltaX,

	theta = -100,

	id = new Float32Array(16);

const camLoc = [15, 8, 0];
var camScale = 1;

const col = [214, 215, 148];

const scrLoc = [-0.5846, 2.7, 0];

const scrVtc = [
	-1.2, -0.6, 0.0,
	1.2, -0.6, 0.0,
	-1.2, 0.6, 0.0,
	1.2, 0.6, 0.0
];

const scrIdc = [
	0, 1, 2,
	2, 1, 3
];

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

		gl.useProgram(cabinet.prog);

		gl.uniformMatrix4fv(cabinet.uniModel, gl.FALSE, cabinet.model);

		gl.useProgram(null);
	}
});

document.addEventListener('mousewheel', function(e) {
	camScale += e.deltaY / 100;

	camScale = Math.min(camScale, 2.0);
	camScale = Math.max(camScale, 0.2);

	gl.useProgram(cabinet.prog);

	mat4.lookAt(cabinet.view, [
		camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
	], scrLoc, [
		0, 1, 0
	]);

	window.gl.uniformMatrix4fv(cabinet.uniView, window.gl.FALSE, cabinet.view);

	gl.useProgram(null);
});

window.addEventListener('resize', fitCanv);

document.addEventListener('DOMContentLoaded', function() {
	// Context
	window.canv = document.getElementById('disp');

	fitCanv();

	window.gl = window.canv.getContext('webgl2');

	if (!window.gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		window.gl = window.canv.getContext('experimental-webgl');
	}

	if (!window.gl) {
		alert('Your browser does not support WebGL');
	}

	window.gl.enable(window.gl.DEPTH_TEST);

	window.gl.enable(window.gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	scr = new MeshLd('scr', 'scr', 'solid', scrLoc);

	cabinet = new MeshLd('cabinet', 'obj', 'dir', [0, 0, 0], [0, theta, 0], [
		scr
	]);

	function draw() {
		window.gl.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		window.gl.clear(window.gl.COLOR_BUFFER_BIT | window.gl.DEPTH_BUFFER_BIT);

		cabinet.draw();

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
