var
	gl,

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
	const canv = document.getElementById('disp');

	gl = canv.getContext('webgl2');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canv.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	// Positions
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	var vtc = Ld.vtc('cabinet');
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// Indices
	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	var idc = Ld.idc('cabinet', type.VTX);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), gl.STATIC_DRAW);

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
	mat4.perspective(proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

	mat4.identity(id);

	mat4.rotate(rot, id, theta, [0, 1, 0]);
	mat4.mul(model, rot, id);

	gl.enable(gl.DEPTH_TEST);

	// Shader
	const
		shadVtxBuff = Util.rd('res/shad/obj.vs'),
		shadFragBuff = Util.rd('res/shad/dir.fs');

	// Vertex
	var shadVtx = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shadVtx, shadVtxBuff);

	gl.compileShader(shadVtx);
	if (!gl.getShaderParameter(shadVtx, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader', gl.getShaderInfoLog(shadVtx));
	}

	// Fragment
	var shadFrag = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shadFrag, shadFragBuff);

	gl.compileShader(shadFrag);
	if (!gl.getShaderParameter(shadFrag, gl.COMPILE_STATUS)) {
		console.error('Error compiling fragment shader', gl.getShaderInfoLog(shadFrag));
	}

	// Program
	prog = gl.createProgram();

	gl.attachShader(prog, shadVtx);
	gl.attachShader(prog, shadFrag);

	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.error('Error linking program', gl.getProgramInfoLog(prog));
	}

	gl.validateProgram(prog);
	if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
		console.error('Error validating program', gl.getProgramInfoLog(prog));
	}

	gl.useProgram(prog);

	// Attributes
	var attrPos = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrPos);

	// Uniforms
	uniModel = gl.getUniformLocation(prog, 'model');
	uniView = gl.getUniformLocation(prog, 'view');
	uniProj = gl.getUniformLocation(prog, 'proj');

	gl.uniformMatrix4fv(uniModel, gl.FALSE, model);
	gl.uniformMatrix4fv(uniView, gl.FALSE, view);
	gl.uniformMatrix4fv(uniProj, gl.FALSE, proj);

	gl.useProgram(null);

	function draw() {
		gl.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindVertexArray(vao);
		gl.useProgram(prog);

		gl.drawElements(gl.TRIANGLES, idc.length, gl.UNSIGNED_BYTE, 0);

		gl.useProgram(null);
		gl.bindVertexArray(null);

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
