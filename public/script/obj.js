const type = {
	VTX: 0,
	TEX: 1,
	NORM: 2
};

const triVtc = 3;

function idx(attr, idc, ln) {
	let attrIdxed = [];
	for (let i = 0; i < idc.length; i++) {
		let idx = idc[i] * ln;

		for (let a = 0; a < ln; a++) {
			attrIdxed.push(attr[idx + a]);
		}
	}

	return attrIdxed;
}

class Obj {
	_noIdc;

	model = mat4.create();
	_acc = mat4.create();

	view = mat4.create();
	_proj = mat4.create();

	_vao;

	_vbo;
	_stbo;

	tex;

	uniModel;
	uniView;
	_uniProj;

	prog;

	_child = [];

	_szVtx = 3;
	_szSt = 2;

	accModel(prev) {
		mat4.mul(this._acc, this.model, prev);

		for (let child of this._child) {
			child.accModel(this._acc);
		}
	}

	constructor(nameObj, nameVtx, nameFrag, loc = [0, 0, 0], rot = [0, 0, 0], child = []) {
		this._vao = gl.createVertexArray();
		gl.bindVertexArray(this._vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);

		let ptUnIdxed = Ld.attr(nameObj, 0);
		let idcVtc = Ld.idc(nameObj, 0);

		let pt = idx(ptUnIdxed, idcVtc, 3);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pt), gl.STATIC_DRAW);

		this._stbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._stbo);

		let stUnIdxed = Ld.attr(nameObj, 1);

		if (stUnIdxed.length) {
			let idcSt = Ld.idc(nameObj, 1);

			let st = idx(stUnIdxed, idcSt, 2);

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(st), gl.STATIC_DRAW);
		}

		this._noIdc = idcVtc.length;

		for (let inst of child) {
			this._child.push(inst);
		}

		/* Matrix */
		this.model = mat4.create();

		mat4.identity(this.model);

		mat4.translate(this.model, this.model, loc);

		for (let i = 0; i < 3; i++) {
			let vec = [0, 0, 0];
			vec[i] = 1;

			mat4.rotate(this.model, this.model, rot[i], vec);
		}

		let id = mat4.create();
		mat4.identity(id);
		this.accModel(id);

		this.view = mat4.create();

		mat4.lookAt(
			this.view,
			camLoc, scrLoc, [
				0, 1, 0
			]
		);

		this._proj = mat4.create();

		mat4.perspective(this._proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

		/* Shader */
		this.prog = new Prog(nameVtx, nameFrag);

		this.prog.use();

		// Attributes
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		let attrPos = gl.getAttribLocation(this.prog.id, "pos");
		gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(attrPos);

		if (stUnIdxed.length) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._stbo);
			let attrSt = gl.getAttribLocation(this.prog.id, "st");
			gl.vertexAttribPointer(attrSt, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
			gl.enableVertexAttribArray(attrSt);
		}

		// Uniforms
		this.uniModel = gl.getUniformLocation(this.prog.id, "model");
		this.uniView = gl.getUniformLocation(this.prog.id, "view");
		this._uniProj = gl.getUniformLocation(this.prog.id, "proj");

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this._acc);
		gl.uniformMatrix4fv(this.uniView, gl.FALSE, this.view);
		gl.uniformMatrix4fv(this._uniProj, gl.FALSE, this._proj);

		this.prog.unUse();
	}

	draw() {
		mat4.lookAt(this.view, [
			camLoc[0], camLoc[1], camLoc[2]
		], scrLoc, [
			0, 1, 0
		]);

		gl.bindVertexArray(this._vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this._acc);
		gl.uniformMatrix4fv(this.uniView, gl.FALSE, this.view);

		gl.bindTexture(gl.TEXTURE_2D, this.tex);

		gl.drawArrays(gl.TRIANGLES, 0, this._noIdc);

		this.prog.unUse();
		gl.bindVertexArray(null);

		for (let obj of this._child) {
			obj.draw();
		}
	}
}
