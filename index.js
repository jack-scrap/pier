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

	window.gl = window.canv.getContext('webgl2');

	if (!window.gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		window.gl = window.canv.getContext('experimental-webgl');
	}

	if (!window.gl) {
		alert('Your browser does not support WebGL');
	}

	var scr = new Mesh(scrVtc, scrIdc, "scr", "solid");

	var vao = window.gl.createVertexArray();
	window.gl.bindVertexArray(vao);

	// Positions
	var vbo = window.gl.createBuffer();
	window.gl.bindBuffer(window.gl.ARRAY_BUFFER, vbo);

	var vtc = Ld.vtc('cabinet');
	window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(vtc), window.gl.STATIC_DRAW);

	// Indices
	var ibo = window.gl.createBuffer();
	window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, ibo);

	var idc = Ld.idc('cabinet', type.VTX);
	window.gl.bufferData(window.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), window.gl.STATIC_DRAW);

	// Matrices
	mat4.identity(model);

	mat4.lookAt(
		view,
		[
			15, 8, 0
		], [
			-0.5846, 2.7, 0
		], [
			0, 1, 0
		]
	);
	mat4.perspective(proj, (1 / 4) * Math.PI, window.canv.clientWidth / window.canv.clientHeight, 0.1, 1000.0);

	mat4.identity(id);

	mat4.rotate(rot, id, theta, [0, 1, 0]);
	mat4.mul(model, rot, id);

	window.gl.enable(window.gl.DEPTH_TEST);

	// Shader
	const
		shadVtxBuff = Util.rd('res/shad/obj.vs'),
		shadFragBuff = Util.rd('res/shad/dir.fs');

	// Vertex
	var shadVtx = window.gl.createShader(window.gl.VERTEX_SHADER);
	window.gl.shaderSource(shadVtx, shadVtxBuff);

	window.gl.compileShader(shadVtx);
	if (!window.gl.getShaderParameter(shadVtx, window.gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader', window.gl.getShaderInfoLog(shadVtx));
	}

	// Fragment
	var shadFrag = window.gl.createShader(window.gl.FRAGMENT_SHADER);
	window.gl.shaderSource(shadFrag, shadFragBuff);

	window.gl.compileShader(shadFrag);
	if (!window.gl.getShaderParameter(shadFrag, window.gl.COMPILE_STATUS)) {
		console.error('Error compiling fragment shader', window.gl.getShaderInfoLog(shadFrag));
	}

	// Program
	prog = window.gl.createProgram();

	window.gl.attachShader(prog, shadVtx);
	window.gl.attachShader(prog, shadFrag);

	window.gl.linkProgram(prog);
	if (!window.gl.getProgramParameter(prog, window.gl.LINK_STATUS)) {
		console.error('Error linking program', window.gl.getProgramInfoLog(prog));
	}

	window.gl.validateProgram(prog);
	if (!window.gl.getProgramParameter(prog, window.gl.VALIDATE_STATUS)) {
		console.error('Error validating program', window.gl.getProgramInfoLog(prog));
	}

	window.gl.useProgram(prog);

	// Attributes
	var attrPos = window.gl.getAttribLocation(prog, 'pos');
	window.gl.vertexAttribPointer(attrPos, 3, window.gl.FLOAT, window.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	window.gl.enableVertexAttribArray(attrPos);

	// Uniforms
	uniModel = window.gl.getUniformLocation(prog, 'model');
	uniView = window.gl.getUniformLocation(prog, 'view');
	uniProj = window.gl.getUniformLocation(prog, 'proj');

	window.gl.uniformMatrix4fv(uniModel, window.gl.FALSE, model);
	window.gl.uniformMatrix4fv(uniView, window.gl.FALSE, view);
	window.gl.uniformMatrix4fv(uniProj, window.gl.FALSE, proj);

	window.gl.useProgram(null);

	function draw() {
		window.gl.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		window.gl.clear(window.gl.DEPTH_BUFFER_BIT | window.gl.COLOR_BUFFER_BIT);

		window.gl.bindVertexArray(vao);
		window.gl.useProgram(prog);

		window.gl.drawElements(window.gl.TRIANGLES, idc.length, window.gl.UNSIGNED_BYTE, 0);

		window.gl.useProgram(null);
		window.gl.bindVertexArray(null);

		scr.draw();

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
