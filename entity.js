class Entity {
	_noPt;

	_mesh;

	model;

	prog;

	uniModel;

	constructor(vtc, loc = [0.0, 0.0], rot = 0.0) {
		this._noPt = vtc.length / 2;

		this._mesh = new Mesh(vtc);

		this.prog = new Prog("vec", "green");

		// Matrix
		this.model = new Float32Array(16);
		mat4.identity(this.model);

		mat4.translate(this.model, this.model, loc);

		mat4.rotate(this.model, this.model, rot, [0, 0, 1]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		// Attributes
		let attrPosShip = gl.getAttribLocation(this.prog.id, "pos");
		gl.vertexAttribPointer(attrPosShip, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(attrPosShip);

		// Uniforms
		this.uniModel = gl.getUniformLocation(this.prog.id, "model");
		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}

	draw() {
		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.drawArrays(gl.LINE_LOOP, 0, this._noPt);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}

class Laser extends Entity {
	static _vtc = [
		0.0, 0.0,
		1.0, 0.0
	];

	constructor() {
		super(Laser._vtc);
	}

	draw() {
		mat4.translate(this.model, this.model, [0.1, 0, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._noPt);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}
