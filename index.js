var
	prog,

	id = new Float32Array(16),
	rot = new Float32Array(16),
	scale = new Float32Array(16),

	model = new Float32Array(16),
	view = new Float32Array(16),
	proj = new Float32Array(16),

	uniModel,
	uniView,
	uniProj,

	drag,

	mouseStartX,
	mouseCurrX,
	mouseDeltaX,

	theta = -100,

	camScale = 1;

const col = [213.72, 215.24, 147.96];

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

		mat4.rotate(rot, id, (theta + mouseDeltaX) / 500, [0, 1, 0]);
		mat4.mul(model, rot, id);

		gl.useProgram(prog);

		gl.uniformMatrix4fv(uniModel, gl.FALSE, model);

		gl.useProgram(null);
	}
});

document.addEventListener('mousewheel', function(e) {
	camScale += -e.deltaY / 100;

	camScale = Math.min(camScale, 5.0);
	camScale = Math.max(camScale, 1.0);

	mat4.scale(scale, id, [
		camScale, camScale, camScale
	]);
	mat4.mul(model, scale, id);

	gl.useProgram(prog);

	gl.uniformMatrix4fv(uniModel, gl.FALSE, model);

	gl.useProgram(null);
});

document.addEventListener('DOMContentLoaded', function() {
	// Context
	window.canv = document.getElementById('disp');

	window.canv.width = window.innerWidth;
	window.canv.height = window.innerHeight;

	window.gl = window.canv.getContext('webgl2');

	if (!window.gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		window.gl = window.canv.getContext('experimental-webgl');
	}

	if (!window.gl) {
		alert('Your browser does not support WebGL');
	}

	window.gl.enable(window.gl.DEPTH_TEST);

	let cabinet = new MeshLd('cabinet', 'obj', 'dir');

	let scr = new Mesh(scrVtc, scrIdc, "scr", "solid");

	function draw() {
		window.gl.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		window.gl.clear(window.gl.DEPTH_BUFFER_BIT | window.gl.COLOR_BUFFER_BIT);

		cabinet.draw();

		scr.draw();

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
