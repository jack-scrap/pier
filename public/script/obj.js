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

	view = mat4.create();
	_proj = mat4.create();

	_vao;

	_vbo;

	uniModel;
	uniView;
	_uniProj;

	prog;

	_szVtx = 3;

	constructor(nameObj, nameVtx, nameFrag, loc = [0, 0, 0]) {
		this._vao = gl.createVertexArray();
		gl.bindVertexArray(this._vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);

		let vtcUnIdxed = Ld.attr(nameObj, 0);
		let idcVtc = Ld.idc(nameObj, 0);

		let vtc = idx(vtcUnIdxed, idcVtc, 3);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

		this._noIdc = idcVtc.length;

		/* Matrix */
		this.model = mat4.create();
		mat4.identity(this.model);

		mat4.translate(this.model, this.model, loc);

		this.view = mat4.create();

		mat4.lookAt(this.view, camLoc, [
			0, 0, 0
		], [
			0, 1, 0
		]);

		this._proj = mat4.create();

		mat4.ortho(this._proj, -(gl.canvas.clientWidth / 2), gl.canvas.clientWidth / 2, -(gl.canvas.clientHeight / 2), gl.canvas.clientHeight / 2, -100.0, 100.0);

		/* Shader */
		this.prog = new Prog(nameVtx, nameFrag);

		this.prog.use();

		// Attributes
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		let attrPos = gl.getAttribLocation(this.prog.id, "pos");
		gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(attrPos);

		// Uniforms
		this.uniModel = gl.getUniformLocation(this.prog.id, "model");
		this.uniView = gl.getUniformLocation(this.prog.id, "view");
		this._uniProj = gl.getUniformLocation(this.prog.id, "proj");

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);
		gl.uniformMatrix4fv(this.uniView, gl.FALSE, this.view);
		gl.uniformMatrix4fv(this._uniProj, gl.FALSE, this._proj);

		this.prog.unUse();
	}

	draw() {
		gl.bindVertexArray(this._vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);
		gl.uniformMatrix4fv(this.uniView, gl.FALSE, this.view);

		gl.drawArrays(gl.TRIANGLES, 0, this._noIdc);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}
