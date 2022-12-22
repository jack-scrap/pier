class Mesh {
	noIdc;

	model = new Float32Array(16);
	acc = new Float32Array(16);

	view = new Float32Array(16);
	proj = new Float32Array(16);

	vao;
	vbo;
	ibo;

	uniModel;
	uniView;
	uniProj;

	prog;

	child = [];

	accModel(prev) {
		mat4.mul(this.acc, this.model, prev);

		for (let inst of this.child) {
			inst.accModel(this.acc);
		}
	}

	constructor(vtc, idc, nameVtx, nameFrag, loc = [0, 0, 0], rot = [0, 0, 0], child = []) {
		this.noIdc = idc.length;

		for (let inst of child) {
			this.child.push(inst);
		}

		this.vao = window.gl.createVertexArray();
		window.gl.bindVertexArray(this.vao);

		this.vbo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vbo);
		window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(vtc), window.gl.STATIC_DRAW);

		this.ibo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		window.gl.bufferData(window.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), window.gl.STATIC_DRAW);

		/* Matrix */
		this.model = new Float32Array(16);

		mat4.identity(this.model);

		mat4.translate(this.model, this.model, loc);

		for (let i = 0; i < 3; i++) {
			let vec = [0, 0, 0];
			vec[i] = 1;

			mat4.rotate(this.model, this.model, rot[i], vec);
		}

		mat4.identity(this.acc);

		mat4.mul(this.acc, this.acc, this.model);

		this.view = new Float32Array(16);

		mat4.lookAt(
			this.view,
			camLoc, scrLoc, [
				0, 1, 0
			]
		);

		this.proj = new Float32Array(16);

		mat4.perspective(this.proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

		/* Shader */
		this.prog = window.gl.createProgram();

		const
			shadVtxBuff = Util.rd('res/shad/' + nameVtx + '.vs'),
			shadFragBuff = Util.rd('res/shad/' + nameFrag + '.fs');

		// Vertex
		let shadVtx = window.gl.createShader(window.gl.VERTEX_SHADER);
		window.gl.shaderSource(shadVtx, shadVtxBuff);

		window.gl.compileShader(shadVtx);
		if (!window.gl.getShaderParameter(shadVtx, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling vertex shader', window.gl.getShaderInfoLog(shadVtx));
		}

		// Fragment
		let shadFrag = window.gl.createShader(window.gl.FRAGMENT_SHADER);
		window.gl.shaderSource(shadFrag, shadFragBuff);

		window.gl.compileShader(shadFrag);
		if (!window.gl.getShaderParameter(shadFrag, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling fragment shader', window.gl.getShaderInfoLog(shadFrag));
		}

		window.gl.attachShader(this.prog, shadVtx);
		window.gl.attachShader(this.prog, shadFrag);

		window.gl.linkProgram(this.prog);
		if (!window.gl.getProgramParameter(this.prog, window.gl.LINK_STATUS)) {
			console.error('Error linking program', window.gl.getProgramInfoLog(this.prog));
		}

		window.gl.validateProgram(this.prog);
		if (!window.gl.getProgramParameter(this.prog, window.gl.VALIDATE_STATUS)) {
			console.error('Error validating program', window.gl.getProgramInfoLog(this.prog));
		}

		window.gl.useProgram(this.prog);

		// Attributes
		let attrPos = window.gl.getAttribLocation(this.prog, 'pos');
		window.gl.vertexAttribPointer(attrPos, 3, window.gl.FLOAT, window.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.gl.enableVertexAttribArray(attrPos);

		// Uniforms
		this.uniModel = window.gl.getUniformLocation(this.prog, 'model');
		this.uniView = window.gl.getUniformLocation(this.prog, 'view');
		this.uniProj = window.gl.getUniformLocation(this.prog, 'proj');

		window.gl.uniformMatrix4fv(this.uniModel, window.gl.FALSE, this.model);
		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, this.view);
		window.gl.uniformMatrix4fv(this.uniProj, window.gl.FALSE, this.proj);

		window.gl.useProgram(null);

		accModel(this.prev);
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
		], scrLoc, [
			0, 1, 0
		]);

		window.gl.bindVertexArray(this.vao);
		window.gl.useProgram(this.prog);

		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, this.view);

		window.gl.useProgram(null);
		window.gl.bindVertexArray(null);

		for (let inst of this.child) {
			inst.draw();
		}
	}
};

class MeshLd {
	noIdc;

	model = new Float32Array(16);
	acc = new Float32Array(16);

	view = new Float32Array(16);
	proj = new Float32Array(16);

	vao;
	vbo;
	ibo;

	uniModel;
	uniView;
	uniProj;

	prog;

	child = [];

	accModel(prev) {
		mat4.mul(this.acc, this.model, prev);

		for (let inst of this.child) {
			inst.accModel(this.acc);
		}
	}

	constructor(nameObj, nameVtx, nameFrag, loc = [0, 0, 0], rot = [0, 0, 0], child = []) {
		this.vao = window.gl.createVertexArray();
		window.gl.bindVertexArray(this.vao);

		let vtc = Ld.vtc(nameObj);

		this.vbo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vbo);
		window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(vtc), window.gl.STATIC_DRAW);

		let idc = Ld.idc(nameObj, type.VTX);

		this.noIdc = idc.length;

		for (let inst of child) {
			this.child.push(inst);
		}

		this.ibo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		window.gl.bufferData(window.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), window.gl.STATIC_DRAW);

		/* Matrix */
		this.model = new Float32Array(16);

		mat4.identity(this.model);

		mat4.translate(this.model, this.model, loc);

		for (let i = 0; i < 3; i++) {
			let vec = [0, 0, 0];
			vec[i] = 1;

			mat4.rotate(this.model, this.model, rot[i], vec);
		}

		mat4.identity(this.acc);

		mat4.mul(this.acc, this.acc, this.model);

		this.view = new Float32Array(16);

		mat4.lookAt(
			this.view,
			camLoc, scrLoc, [
				0, 1, 0
			]
		);

		this.proj = new Float32Array(16);

		mat4.perspective(this.proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

		/* Shader */
		this.prog = window.gl.createProgram();

		const
			shadVtxBuff = Util.rd('res/shad/' + nameVtx + '.vs'),
			shadFragBuff = Util.rd('res/shad/' + nameFrag + '.fs');

		// Vertex
		let shadVtx = window.gl.createShader(window.gl.VERTEX_SHADER);
		window.gl.shaderSource(shadVtx, shadVtxBuff);

		window.gl.compileShader(shadVtx);
		if (!window.gl.getShaderParameter(shadVtx, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling vertex shader', window.gl.getShaderInfoLog(shadVtx));
		}

		// Fragment
		let shadFrag = window.gl.createShader(window.gl.FRAGMENT_SHADER);
		window.gl.shaderSource(shadFrag, shadFragBuff);

		window.gl.compileShader(shadFrag);
		if (!window.gl.getShaderParameter(shadFrag, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling fragment shader', window.gl.getShaderInfoLog(shadFrag));
		}

		window.gl.attachShader(this.prog, shadVtx);
		window.gl.attachShader(this.prog, shadFrag);

		window.gl.linkProgram(this.prog);
		if (!window.gl.getProgramParameter(this.prog, window.gl.LINK_STATUS)) {
			console.error('Error linking program', window.gl.getProgramInfoLog(this.prog));
		}

		window.gl.validateProgram(this.prog);
		if (!window.gl.getProgramParameter(this.prog, window.gl.VALIDATE_STATUS)) {
			console.error('Error validating program', window.gl.getProgramInfoLog(this.prog));
		}

		window.gl.useProgram(this.prog);

		// Attributes
		let attrPos = window.gl.getAttribLocation(this.prog, 'pos');
		window.gl.vertexAttribPointer(attrPos, 3, window.gl.FLOAT, window.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.gl.enableVertexAttribArray(attrPos);

		// Uniforms
		this.uniModel = window.gl.getUniformLocation(this.prog, 'model');
		this.uniView = window.gl.getUniformLocation(this.prog, 'view');
		this.uniProj = window.gl.getUniformLocation(this.prog, 'proj');

		window.gl.uniformMatrix4fv(this.uniModel, window.gl.FALSE, this.model);
		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, this.view);
		window.gl.uniformMatrix4fv(this.uniProj, window.gl.FALSE, this.proj);

		window.gl.useProgram(null);

		this.accModel(this.acc);
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
		], scrLoc, [
			0, 1, 0
		]);

		window.gl.bindVertexArray(this.vao);
		window.gl.useProgram(this.prog);

		window.gl.uniformMatrix4fv(this.uniModel, window.gl.FALSE, this.acc);
		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, this.view);

		window.gl.drawElements(window.gl.TRIANGLES, this.noIdc, window.gl.UNSIGNED_BYTE, 0);

		window.gl.useProgram(null);
		window.gl.bindVertexArray(null);

		for (let inst of this.child) {
			inst.draw();
		}
	}
};

const
	type = {
		VTX: 0,
		TEX: 1,
		NORM: 2
	},

	triVtc = 3;
