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

	static _peakFreq = 1200.0;
	static _releaseFreq = 400.0;

	static _decay = 0.16;

	constructor() {
		super(Laser._pt);

		// Source
		let osc = audioCtx.createOscillator();
		osc.type = "sawtooth";
		osc.frequency.value = Laser._peakFreq;

		osc.frequency.exponentialRampToValueAtTime(400.0, audioCtx.currentTime + Laser._decay);

		// Effect
		let filter = audioCtx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 400.0;

		// Route
		osc.connect(filter);
		filter.connect(audioCtx.destination);

		// Schedule
		osc.start();

		osc.stop(audioCtx.currentTime + Laser._decay);
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

	static _rot = Math.PI * 2;

	static _decayTime = 0.6;

	constructor(minSz, maxSz) {
		const n = randInt(AsteLg._minPt, AsteLg._maxPt);

		const inc = AsteLg._rot / n;

		let pt = [];
		for (let i = 0; i < n; i++) {
			let angle = i * inc;

			pt.push(Math.cos(angle) * randFloat(minSz, maxSz));
			pt.push(Math.sin(angle) * randFloat(minSz, maxSz));
		}

		super(pt);

		mat4.rotate(this.model, this.model, randFloat(0, AsteLg._rot), [0, 0, 1]);

		mat4.translate(this.model, this.model, [randFloat(0.5, 1), randFloat(0.5, 1), 0]);

		this.prog.use();

		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		this.prog.unUse();
	}

	destroy() {
		// Source
		let osc = audioCtx.createOscillator();
		osc.type = "square";
		osc.frequency.value = 80.0;

		// Effect
		let filter = audioCtx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 80.0;

		// Route
		osc.connect(filter);
		filter.connect(audioCtx.destination);

		// Schedule
		osc.start();

		osc.frequency.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + AsteLg._decayTime);
		filter.frequency.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 1.5);

		osc.stop(audioCtx.currentTime + AsteLg._decayTime);
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

class AsteLg extends Aste {
	static _minSz = 1;
	static _maxSz = 1.5;

	destroy() {
		super.destroy();

		let child = [];
		for (let i = 0; i < 3; i++) {
			child.push(new AsteSm());
		}

		return child;
	}

	constructor() {
		super(AsteLg._minSz, AsteLg._maxSz);
	}
}

class AsteSm extends Aste {
	static _minSz = 0.5;
	static _maxSz = 1.0;

	constructor() {
		super(AsteLg._minSz, AsteLg._maxSz);
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

	_carrier;
	_lfo;
	_lfoGain;

	constructor() {
		let y = randFloat(-1.0, 1.0);

		let side = randInt(0, 2);

		super(UFO._pt, [side ? 1 : -1, y]);

		this._side = side;

		// Source
		this._carrier = audioCtx.createOscillator();
		this._carrier.type = "triangle";
		this._carrier.frequency.value = 300;

		this._lfo = audioCtx.createOscillator();
		this._lfo.type = "sine";
		this._lfo.frequency.value = 7.0;

		this._lfoGain = audioCtx.createGain();
		this._lfoGain.gain.value = 30.0;

		// Route
		this._lfo.connect(this._lfoGain);
		this._lfoGain.connect(this._carrier.frequency);
		this._carrier.connect(audioCtx.destination);

		// Schedule
		this._carrier.start();
		this._lfo.start();
	}

	destroy() {
		this._carrier.stop();
		this._lfo.stop();
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
