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
		this._vao = ctx.createVertexArray();
		ctx.bindVertexArray(this._vao);

		let vtcUnIdxed = Ld.attr(nameObj, 0);

		let idcVtc = Ld.idc(nameObj, 0);

		let vtc = [];
		for (let i = 0; i < idcVtc.length; i++) {
			let idx = idcVtc[i] * 3;

			vtc.push(vtcUnIdxed[idx]);
			vtc.push(vtcUnIdxed[idx + 1]);
			vtc.push(vtcUnIdxed[idx + 2]);
		}

		this._vbo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vbo);
		ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vtc), ctx.STATIC_DRAW);

		this._stbo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, this._stbo);

		let stUnIdxed = Ld.attr(nameObj, 1);

		let idcSt = Ld.idc(nameObj, 1);

		let st = [];
		for (let i = 0; i < idcSt.length; i++) {
			let idx = idcSt[i] * 2;

			st.push(stUnIdxed[idx]);
			st.push(stUnIdxed[idx + 1]);
		}

		ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(st), ctx.STATIC_DRAW);

		this._noIdc = idcVtc.length;

		for (let inst of child) {
			this._child.push(inst);
		}

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

		ctx.useProgram(this.prog.id);

		// Attributes
		ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vbo);
		let attrPos = ctx.getAttribLocation(this.prog.id, 'pos');
		ctx.vertexAttribPointer(attrPos, 3, ctx.FLOAT, ctx.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		ctx.enableVertexAttribArray(attrPos);

		ctx.bindBuffer(ctx.ARRAY_BUFFER, this._stbo);
		let attrSt = ctx.getAttribLocation(this.prog.id, 'st');
		ctx.vertexAttribPointer(attrSt, 2, ctx.FLOAT, ctx.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		ctx.enableVertexAttribArray(attrSt);

		// Uniforms
		this.uniModel = ctx.getUniformLocation(this.prog.id, 'model');
		this.uniView = ctx.getUniformLocation(this.prog.id, 'view');
		this._uniProj = ctx.getUniformLocation(this.prog.id, 'proj');

		ctx.uniformMatrix4fv(this.uniModel, ctx.FALSE, this.model);
		ctx.uniformMatrix4fv(this.uniView, ctx.FALSE, this.view);
		ctx.uniformMatrix4fv(this._uniProj, ctx.FALSE, this._proj);

		ctx.useProgram(null);

		this.accModel(this._acc);
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
		], scrLoc, [
			0, 1, 0
		]);

		ctx.bindVertexArray(this._vao);
		ctx.useProgram(this.prog.id);

		ctx.uniformMatrix4fv(this.uniModel, ctx.FALSE, this._acc);
		ctx.uniformMatrix4fv(this.uniView, ctx.FALSE, this.view);

		ctx.drawArrays(ctx.TRIANGLES, 0, this._noIdc);

		ctx.useProgram(null);
		ctx.bindVertexArray(null);

		for (let inst of this._child) {
			inst.draw();
		}
	}
};
