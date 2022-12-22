const type = {
	VTX: 0,
	TEX: 1,
	NORM: 2
};

const triVtc = 3;

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
		this._vao = window.ctx.createVertexArray();
		window.ctx.bindVertexArray(this._vao);

		let vtc = Ld.attr(nameObj, 0);

		this._vbo = window.ctx.createBuffer();
		window.ctx.bindBuffer(window.ctx.ARRAY_BUFFER, this._vbo);
		window.ctx.bufferData(window.ctx.ARRAY_BUFFER, new Float32Array(vtc), window.ctx.STATIC_DRAW);

		this._stbo = window.ctx.createBuffer();
		window.ctx.bindBuffer(window.ctx.ARRAY_BUFFER, this._stbo);

		const st = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
		]
		window.ctx.bufferData(window.ctx.ARRAY_BUFFER, new Float32Array(st), window.ctx.STATIC_DRAW);

		let idc = Ld.idc(nameObj, type.VTX);

		this._noIdc = idc.length;

		for (let inst of child) {
			this._child.push(inst);
		}

		this._ibo = window.ctx.createBuffer();
		window.ctx.bindBuffer(window.ctx.ELEMENT_ARRAY_BUFFER, this._ibo);
		window.ctx.bufferData(window.ctx.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), window.ctx.STATIC_DRAW);

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
		this.prog = new Prog(nameVtx, nameFrag);

		window.ctx.useProgram(this.prog.id);

		// Attributes
		window.ctx.bindBuffer(window.ctx.ARRAY_BUFFER, this._vbo);
		let attrPos = window.ctx.getAttribLocation(this.prog.id, 'pos');
		window.ctx.vertexAttribPointer(attrPos, 3, window.ctx.FLOAT, window.ctx.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.ctx.enableVertexAttribArray(attrPos);

		window.ctx.bindBuffer(window.ctx.ARRAY_BUFFER, this._stbo);
		let attrSt = window.ctx.getAttribLocation(this.prog.id, 'st');
		window.ctx.vertexAttribPointer(attrSt, 2, window.ctx.FLOAT, window.ctx.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.ctx.enableVertexAttribArray(attrSt);

		// Uniforms
		this.uniModel = window.ctx.getUniformLocation(this.prog.id, 'model');
		this.uniView = window.ctx.getUniformLocation(this.prog.id, 'view');
		this._uniProj = window.ctx.getUniformLocation(this.prog.id, 'proj');

		window.ctx.uniformMatrix4fv(this.uniModel, window.ctx.FALSE, this.model);
		window.ctx.uniformMatrix4fv(this.uniView, window.ctx.FALSE, this.view);
		window.ctx.uniformMatrix4fv(this._uniProj, window.ctx.FALSE, this._proj);

		window.ctx.useProgram(null);

		this.accModel(this._acc);
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
		], scrLoc, [
			0, 1, 0
		]);

		window.ctx.bindVertexArray(this._vao);
		window.ctx.useProgram(this.prog.id);

		window.ctx.uniformMatrix4fv(this.uniModel, window.ctx.FALSE, this._acc);
		window.ctx.uniformMatrix4fv(this.uniView, window.ctx.FALSE, this.view);

		window.ctx.drawElements(window.ctx.TRIANGLES, this._noIdc, window.ctx.UNSIGNED_BYTE, 0);

		window.ctx.useProgram(null);
		window.ctx.bindVertexArray(null);

		for (let inst of this._child) {
			inst.draw();
		}
	}
};
