class Mesh {
	_noIdc;

	model = new Float32Array(16);
	_acc = new Float32Array(16);

	view = new Float32Array(16);
	_proj = new Float32Array(16);

	_vao;

	_vbo;
	_stbo;

	_ibo;

	uniModel;
	uniView;
	_uniProj;

	prog;

	_child = [];

	accModel(prev) {
		mat4.mul(this._acc, this.model, prev);

		for (let inst of this._child) {
			inst.accModel(this._acc);
		}
	}

	constructor(nameObj, nameVtx, nameFrag, loc = [0, 0, 0], rot = [0, 0, 0], child = []) {
		this._vao = window.gl.createVertexArray();
		window.gl.bindVertexArray(this._vao);

		let vtc = Ld.attr(nameObj, 0);

		this._vbo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this._vbo);
		window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(vtc), window.gl.STATIC_DRAW);

		this._stbo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this._stbo);

		const st = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
		]
		window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(st), window.gl.STATIC_DRAW);

		let idc = Ld.idc(nameObj, type.VTX);

		this._noIdc = idc.length;

		for (let inst of child) {
			this._child.push(inst);
		}

		this._ibo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, this._ibo);
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

		let id = new Float32Array(16);
		mat4.identity(id);
		this.accModel(id);

		this.view = new Float32Array(16);

		mat4.lookAt(
			this.view,
			camLoc, scrLoc, [
				0, 1, 0
			]
		);

		this._proj = new Float32Array(16);

		mat4.perspective(this._proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

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
		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this._vbo);
		let attrPos = window.gl.getAttribLocation(this.prog, 'pos');
		window.gl.vertexAttribPointer(attrPos, 3, window.gl.FLOAT, window.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.gl.enableVertexAttribArray(attrPos);

		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this._stbo);
		let attrSt = window.gl.getAttribLocation(this.prog, 'st');
		window.gl.vertexAttribPointer(attrSt, 2, window.gl.FLOAT, window.gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.gl.enableVertexAttribArray(attrSt);

		// Uniforms
		this.uniModel = window.gl.getUniformLocation(this.prog, 'model');
		this.uniView = window.gl.getUniformLocation(this.prog, 'view');
		this._uniProj = window.gl.getUniformLocation(this.prog, 'proj');

		window.gl.uniformMatrix4fv(this.uniModel, window.gl.FALSE, this.model);
		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, this.view);
		window.gl.uniformMatrix4fv(this._uniProj, window.gl.FALSE, this._proj);

		window.gl.useProgram(null);

		this.accModel(this._acc);
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
		], scrLoc, [
			0, 1, 0
		]);

		window.gl.bindVertexArray(this._vao);
		window.gl.useProgram(this.prog);

		window.gl.uniformMatrix4fv(this.uniModel, window.gl.FALSE, this._acc);
		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, this.view);

		window.gl.drawElements(window.gl.TRIANGLES, this._noIdc, window.gl.UNSIGNED_BYTE, 0);

		window.gl.useProgram(null);
		window.gl.bindVertexArray(null);

		for (let inst of this._child) {
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
