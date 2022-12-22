var
	cabinet,
	scr,

	drag,

	mouseStartX,
	mouseCurrX,
	mouseDeltaX,

	theta = -100,

	id = new Float32Array(16),
	idWorld = new Float32Array(16);

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

	scr = new Mesh('scr', 'tex', 'tex', scrLoc);

	gl.useProgram(scr.prog);

	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('texImg'));

	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.useProgram(scr.prog);

	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.activeTexture(gl.TEXTURE0);

	gl.useProgram(null);

	cabinet = new Mesh('cabinet', 'obj', 'dir', [0, 0, 0], [0, theta, 0], [
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
