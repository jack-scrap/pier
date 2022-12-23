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

	_szVtx = 3;
	_szSt = 2;

	accModel(prev) {
		mat4.mul(this._acc, this.model, prev);

		for (let inst of this._child) {
			inst.accModel(this._acc);
		}
	}

	constructor(nameObj, nameVtx, nameFrag, loc = [0, 0, 0], rot = [0, 0, 0], child = []) {
		this._vao = gl.createVertexArray();
		gl.bindVertexArray(this._vao);

		let vtcUnIdxed = Ld.attr(nameObj, 0);

		let idcVtc = Ld.idc(nameObj, 0);

		let vtc = [];
		for (let i = 0; i < idcVtc.length; i++) {
			let idx = idcVtc[i] * this._szVtx;

			for (let i = 0; i < this._szVtx; i++) {
				vtc.push(vtcUnIdxed[idx + i]);
			}
		}

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

		this._stbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._stbo);

		let stUnIdxed = Ld.attr(nameObj, 1);

		if (stUnIdxed.length) {
			let idcSt = Ld.idc(nameObj, 1);

			let st = [];
			for (let i = 0; i < idcSt.length; i++) {
				let idx = idcSt[i] * this._szSt;

				for (let i = 0; i < this._szSt; i++) {
					st.push(stUnIdxed[idx + i]);
				}
			}

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(st), gl.STATIC_DRAW);
		}

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

		this.prog.use();

		// Attributes
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		let attrPos = gl.getAttribLocation(this.prog.id, 'pos');
		gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(attrPos);

		if (stUnIdxed.length) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._stbo);
			let attrSt = gl.getAttribLocation(this.prog.id, 'st');
			gl.vertexAttribPointer(attrSt, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
			gl.enableVertexAttribArray(attrSt);
		}

		// Uniforms
		this.uniModel = gl.getUniformLocation(this.prog.id, 'model');
		this.uniView = gl.getUniformLocation(this.prog.id, 'view');
		this._uniProj = gl.getUniformLocation(this.prog.id, 'proj');

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);
		gl.uniformMatrix4fv(this.uniView, gl.FALSE, this.view);
		gl.uniformMatrix4fv(this._uniProj, gl.FALSE, this._proj);

		this.prog.unUse();

		this.accModel(this._acc);
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0] * camScale, camLoc[1] * camScale, camLoc[2] * camScale
		], scrLoc, [
			0, 1, 0
		]);

		gl.bindVertexArray(this._vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this._acc);
		gl.uniformMatrix4fv(this.uniView, gl.FALSE, this.view);

		gl.drawArrays(gl.TRIANGLES, 0, this._noIdc);

		this.prog.unUse();
		gl.bindVertexArray(null);

		for (let inst of this._child) {
			inst.draw();
		}
	}
};
