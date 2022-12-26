class Vec {
	_pt;

	_mesh;

	model;

	prog;

	uniModel;

	constructor(pt, loc = [0.0, 0.0], rot = 0.0) {
		this._pt = pt;

		this._mesh = new Mesh(pt);

		this.prog = new Prog("vec", "green");

		// Matrix
		this.model = new Float32Array(16);
		mat4.identity(this.model);

		mat4.translate(this.model, this.model, [loc[0], loc[1], 0]);

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

		gl.drawArrays(gl.LINE_LOOP, 0, this._pt.length);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}

class Ship extends Vec {
	static _vtc = [
		-0.6, -1.0,
		0.6, -1.0,
		0.0, 1.0
	];

	static speedDefault = 0.003;
	static speedFast = 0.01;

	speed = Ship.speedDefault;

	constructor() {
		super(Ship._vtc);
	}

	draw() {
		mat4.translate(this.model, this.model, [0, this.speed, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._pt.length);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}

class Laser extends Vec {
	static _vtc = [
		0.0, 0.0,
		0.0, 1.0
	];

	constructor() {
		super(Laser._vtc);
	}

	draw() {
		mat4.translate(this.model, this.model, [0, 0.1, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._pt.length);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}

class Aste extends Vec {
	static _minPt = 5;
	static _maxPt = 7;

	static _minSz = 1;
	static _maxSz = 1.5;

	static _rot = Math.PI * 2;

	constructor() {
		const n = randInt(Aste._minPt, Aste._maxPt);

		const inc = Aste._rot / n;

		let vtc = [];
		for (let i = 0; i < n; i++) {
			vtc.push(Math.cos(i * inc) * randFloat(Aste._minSz, Aste._maxSz));
			vtc.push(Math.sin(i * inc) * randFloat(Aste._minSz, Aste._maxSz));
		}

		super(vtc);

		mat4.rotate(this.model, this.model, randFloat(0, Aste._rot), [0, 0, 1]);

		mat4.translate(this.model, this.model, [randFloat(0, 1), randFloat(0, 1), 0]);

		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		this.prog.unUse();
	}

	draw() {
		mat4.translate(this.model, this.model, [0, 0.01, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._pt.length);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}
