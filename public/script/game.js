class Vec {
	_pt;
	_noPt;

	_mesh;

	model;

	prog;

	uniModel;

	constructor(pt, loc = [0.0, 0.0], rot = 0.0) {
		this._pt = pt;
		this._noPt = this._pt.length / 2;

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
		let attrPos = gl.getAttribLocation(this.prog.id, "pos");
		gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(attrPos);

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

class Ship extends Vec {
	static _pt = [
		-0.6, -1.0,
		0.6, -1.0,
		0.0, 1.0
	];

	static speedDefault = 0.003;
	static speedFast = 0.01;

	speed = Ship.speedDefault;

	constructor() {
		super(Ship._pt);
	}

	draw() {
		mat4.translate(this.model, this.model, [0, this.speed, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._noPt);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}

class Laser extends Vec {
	static _pt = [
		0.0, 0.0,
		0.0, 1.0
	];

	constructor() {
		super(Laser._pt);
	}

	draw() {
		mat4.translate(this.model, this.model, [0, 0.1, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINES, 0, this._noPt);

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

		let pt = [];
		for (let i = 0; i < n; i++) {
			let angle = i * inc;

			pt.push(Math.cos(angle) * randFloat(Aste._minSz, Aste._maxSz));
			pt.push(Math.sin(angle) * randFloat(Aste._minSz, Aste._maxSz));
		}

		super(pt);

		mat4.rotate(this.model, this.model, randFloat(0, Aste._rot), [0, 0, 1]);
	}

	draw() {
		mat4.translate(this.model, this.model, [0, 0.01, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._noPt);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}

class UFO extends Vec {
	static _pt = [
		0.0, 1.0,
		-2.0, 0.0,
		0.0, -1.0,
		2.0, 0.0,
		0.0, 1.0,
		0.0, 1.6
	];

	static _speed = 0.01;

	_side;

	constructor() {
		let y = randFloat(-1.0, 1.0);

		let side = randInt(0, 2);

		super(UFO._pt, [side ? 1 : -1, y]);

		this._side = side;
	}

	draw() {
		mat4.translate(this.model, this.model, [(this._side ? -1 : 1) * UFO._speed, 0.00, 0]);

		gl.bindVertexArray(this._mesh.vao);
		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		gl.drawArrays(gl.LINE_LOOP, 0, this._noPt);

		this.prog.unUse();
		gl.bindVertexArray(null);
	}
}
